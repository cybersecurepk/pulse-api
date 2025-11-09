import { Injectable, BadRequestException } from '@nestjs/common';

interface OtpData {
  otp: string;
  expiresAt: Date;
  lastSentAt: Date;
}

@Injectable()
export class OtpService {
  private otpStorage: Map<string, OtpData> = new Map();

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  saveOtp(email: string, otp: string): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    this.otpStorage.set(email, {
      otp,
      expiresAt,
      lastSentAt: now,
    });

    // Auto-cleanup after expiry
    setTimeout(() => {
      this.otpStorage.delete(email);
    }, 5 * 60 * 1000);
  }

  verifyOtp(email: string, otp: string): boolean {
    const otpData = this.otpStorage.get(email);

    if (!otpData) {
      return false;
    }

    if (new Date() > otpData.expiresAt) {
      this.otpStorage.delete(email);
      return false;
    }

    if (otpData.otp !== otp) {
      return false;
    }

    // OTP verified successfully, remove it
    this.otpStorage.delete(email);
    return true;
  }

  canResendOtp(email: string): boolean {
    const otpData = this.otpStorage.get(email);

    if (!otpData) {
      return true; // No OTP sent yet
    }

    const now = new Date();
    const timeSinceLastSent = now.getTime() - otpData.lastSentAt.getTime();
    const oneMinuteInMs = 60 * 1000;

    return timeSinceLastSent >= oneMinuteInMs;
  }

  getTimeUntilResend(email: string): number {
    const otpData = this.otpStorage.get(email);

    if (!otpData) {
      return 0;
    }

    const now = new Date();
    const timeSinceLastSent = now.getTime() - otpData.lastSentAt.getTime();
    const oneMinuteInMs = 60 * 1000;

    const remainingTime = oneMinuteInMs - timeSinceLastSent;
    return remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0;
  }
}
