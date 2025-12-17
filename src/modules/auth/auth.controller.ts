import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  Res,
  UnauthorizedException,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  UseFilters,
  Param,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { Public } from "../../decorator/isPublic";
import type { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { FileInterceptor } from "@nestjs/platform-express";

// DTO for Google authentication from frontend
class GoogleAuthDto {
  accessToken: string;
  refreshToken: string;
  email: string;
  name: string;
  picture: string;
}

// Custom exception filter for Google OAuth errors
@Catch()
class GoogleOAuthExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Determine the appropriate error message based on the exception type
    let redirectError = 'auth_failed';
    
    if (exception instanceof UnauthorizedException) {
      if (exception.message.includes('not approved')) {
        redirectError = 'not_approved';
      } else if (exception.message.includes('not found')) {
        redirectError = 'email_not_found';
      } else {
        redirectError = 'auth_failed';
      }
    } else if (exception.name === 'AuthorizationError' || 
               (exception.oauthError && exception.oauthError === 'access_denied')) {
      redirectError = 'google_access_denied';
    }
    
    // Redirect to frontend login page with error parameter
    response.redirect(`http://localhost:3021/auth/sign-in?error=${redirectError}`);
  }
}

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Public()
  @Get("google/login")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google login" })
  @ApiResponse({ status: 200, description: "Google login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  @ApiOperation({ summary: "Google callback" })
  @ApiResponse({ status: 200, description: "Google callback successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @UseFilters(GoogleOAuthExceptionFilter)
  async googleCallback(@Req() req: Request & { user?: any }, @Res() res: Response) {
    try {
      // If we reach here, authentication was successful
      // But let's double-check that we have a user
      if (!req.user) {
        return res.redirect(`http://localhost:3021/auth/sign-in?error=auth_failed`);
      }
      
      // Validate the Google user against our database
      const validatedUser = await this.authService.validateGoogleUser(req.user);
      
      // Generate access token for the user
      const { accessToken, refreshToken, user } = await this.authService.loginWithUser(validatedUser);
      
      // Encode user data as base64 to pass in URL
      const userData = Buffer.from(JSON.stringify(user)).toString('base64');
      
      // Redirect to frontend Google callback page with tokens and user data
      const redirectUrl = `http://localhost:3021/auth/google-callback?token=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(userData)}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth Callback Error:', error);
      
      // Determine the appropriate error message based on the error type
      let redirectError = 'auth_failed';
      
      if (error instanceof UnauthorizedException) {
        if (error.message.includes('not approved')) {
          redirectError = 'not_approved';
        } else if (error.message.includes('not found')) {
          redirectError = 'email_not_found';
        } else {
          redirectError = 'auth_failed';
        }
      }
      
      return res.redirect(`http://localhost:3021/auth/sign-in?error=${redirectError}`);
    }
  }






  // New endpoint for handling Google authentication from frontend NextAuth
  @Public()
  @Post("google")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Authenticate with Google OAuth tokens from frontend" })
  @ApiResponse({ status: 200, description: "Authentication successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async googleAuthFromFrontend(@Body() googleAuthDto: GoogleAuthDto, @Res() res: Response) {
    try {
      // Here you would typically validate the Google tokens with Google's API
      // For now, we'll simulate getting user info from Google tokens
      
      // Check if user exists in database
      const user = await this.authService.validateGoogleUser({
        email: googleAuthDto.email,
        name: googleAuthDto.name,
        picture: googleAuthDto.picture
      });
      
      // Generate access token for the user
      const { accessToken, refreshToken } = await this.authService.loginWithUser(user);
      
      // Return the tokens and user data
      return res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          applicationStatus: user.applicationStatus,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      });
    } catch (error) {
      console.error('Google Auth from Frontend Error:', error);
      
      if (error instanceof UnauthorizedException) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: error.message
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Authentication failed'
      });
    }
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and request OTP" })
  @ApiResponse({ status: 200, description: "OTP sent successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.loginWithEmail(loginDto);
  }

  @Public()
  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify OTP and complete login" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid OTP" })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post("resend-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend OTP" })
  @ApiResponse({ status: 200, description: "OTP resent successfully" })
  @ApiResponse({ status: 400, description: "Rate limit exceeded" })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }
}