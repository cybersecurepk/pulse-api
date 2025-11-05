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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { Public } from "../../decorator/isPublic";
import type { Request, Response } from "express";

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
  async googleCallback(@Req() req: Request & { user?: any }, @Res() res: Response) {
    try {
      if (!req.user) {
        return res.redirect(`http://localhost:3021/auth/sign-in?error=auth_failed`);
      }
      
      // Generate access token for the user
      const { accessToken, refreshToken, user } = await this.authService.loginWithUser(req.user);
      
      // Encode user data as base64 to pass in URL
      const userData = Buffer.from(JSON.stringify(user)).toString('base64');
      
      // Redirect to frontend Google callback page with tokens and user data
      const redirectUrl = `http://localhost:3021/auth/google-callback?token=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(userData)}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      return res.redirect(`http://localhost:3021/auth/sign-in?error=auth_failed`);
    }
  }
}