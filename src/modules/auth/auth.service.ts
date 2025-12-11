import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User, ApplicationStatus } from '../user/entities/user.entity';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../token/token.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { MailService } from '../mail/mail.service';
import { OtpService } from '../otp/otp.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private mailService: MailService,
    private otpService: OtpService,
  ) {}

  private generateRefreshTokenPayload(userPayload: any) {
    return {
      ...userPayload,
      jti: randomBytes(16).toString('hex'), // unique token identifier (JWT ID)
      iat: Math.floor(Date.now() / 1000), // issued at timestamp
    };
  }

  async validateGoogleUser(googleUser: any): Promise<User> {
    // Check if user exists in database
    const user = await this.userService.findByEmail(googleUser.email);

    // If user doesn't exist, they haven't been registered as an applicant
    if (!user) {
      throw new UnauthorizedException('Email not found in applicant database');
    }

    // Check if user's application is approved
    if (user.applicationStatus !== ApplicationStatus.APPROVED) {
      throw new UnauthorizedException('Account not approved yet');
    }

    // User exists and is approved, return the user object
    return user;
  }

  async loginWithUser(user: User): Promise<AuthResponseDto> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      this.generateRefreshTokenPayload(payload),
      { expiresIn: '7d' },
    );

    await this.tokenService.saveToken(refreshToken, user);

    // Return the user object with only the necessary fields
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      applicationStatus: user.applicationStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { accessToken, refreshToken, user: userResponse };
  }

  async loginWithEmail(
    loginDto: LoginDto,
  ): Promise<{ message: string; otp?: string }> {
    const { email } = loginDto;

    // Check if user exists
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email not found in our system');
    }

    // Check if user's application is approved
    if (user.applicationStatus !== ApplicationStatus.APPROVED) {
      throw new UnauthorizedException('Your account is not approved yet');
    }

    // Check rate limit
    if (!(await this.otpService.canResendOtp(email))) {
      const waitTime = await this.otpService.getTimeUntilResend(email);
      throw new BadRequestException(
        `Please wait ${waitTime} seconds before requesting a new OTP`,
      );
    }

    // Generate and send OTP
    const otp = this.otpService.generateOtp();
    await this.otpService.saveOtp(email, otp);

    let emailSent = true;
    try {
      await this.mailService.sendOtpEmail(email, user.name, otp);
    } catch (error) {
      // Allow login flow to continue even if email sending fails (e.g., missing AWS creds)
      emailSent = false;
      console.error('Failed to send OTP email. OTP is stored in DB.', error);
    }

    // In non-production environments, expose OTP to facilitate manual copy/paste
    const isProd = process.env.NODE_ENV === 'production';
    return {
      message: emailSent
        ? 'OTP sent to your email address. Please check your inbox.'
        : 'OTP generated and stored. Email not sent (missing email config).',
      otp: isProd ? undefined : otp,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
    const { email, otp } = verifyOtpDto;

    // Verify OTP
    const isValid = await this.otpService.verifyOtp(email, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Get user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate tokens and login
    return this.loginWithUser(user);
  }

  async resendOtp(
    resendOtpDto: ResendOtpDto,
  ): Promise<{ message: string; waitTime?: number; otp?: string }> {
    const { email } = resendOtpDto;

    // Check if user exists
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email not found in our system');
    }

    // Check rate limit
    if (!(await this.otpService.canResendOtp(email))) {
      const waitTime = await this.otpService.getTimeUntilResend(email);
      throw new BadRequestException(
        `Please wait ${waitTime} seconds before requesting a new OTP`,
      );
    }

    // Generate and send new OTP
    const otp = this.otpService.generateOtp();
    await this.otpService.saveOtp(email, otp);

    let emailSent = true;
    try {
      await this.mailService.sendOtpEmail(email, user.name, otp);
    } catch (error) {
      emailSent = false;
      console.error('Failed to resend OTP email. OTP is stored in DB.', error);
    }

    const isProd = process.env.NODE_ENV === 'production';
    return {
      message: emailSent
        ? 'New OTP sent to your email address.'
        : 'New OTP generated and stored. Email not sent (missing email config).',
      otp: isProd ? undefined : otp,
    };
  }
}
