import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async saveOtp(email: string, otp: string): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    // Upsert OTP for this email
    const existing = await this.otpRepository.findOne({ where: { email } });
    if (existing) {
      existing.otp = otp;
      existing.expiresAt = expiresAt;
      existing.lastSentAt = now;
      await this.otpRepository.save(existing);
    } else {
      const record = this.otpRepository.create({
        email,
        otp,
        expiresAt,
        lastSentAt: now,
      });
      await this.otpRepository.save(record);
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const record = await this.otpRepository.findOne({ where: { email } });
    if (!record) {
      return false;
    }

    if (new Date() > record.expiresAt) {
      await this.otpRepository.delete({ email });
      return false;
    }

    if (record.otp !== otp) {
      return false;
    }

    // OTP verified successfully, remove it
    await this.otpRepository.delete({ email });
    return true;
  }

  async canResendOtp(email: string): Promise<boolean> {
    const record = await this.otpRepository.findOne({ where: { email } });
    if (!record) {
      return true; // No OTP sent yet
    }

    const now = new Date();
    const timeSinceLastSent = now.getTime() - record.lastSentAt.getTime();
    const oneMinuteInMs = 60 * 1000;

    return timeSinceLastSent >= oneMinuteInMs;
  }

  async getTimeUntilResend(email: string): Promise<number> {
    const record = await this.otpRepository.findOne({ where: { email } });
    if (!record) {
      return 0;
    }

    const now = new Date();
    const timeSinceLastSent = now.getTime() - record.lastSentAt.getTime();
    const oneMinuteInMs = 60 * 1000;

    const remainingTime = oneMinuteInMs - timeSinceLastSent;
    return remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0;
  }
}
