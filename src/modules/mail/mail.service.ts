import { Injectable } from '@nestjs/common';
import { SESEmailService } from '../../utils/ses-email.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private sesService: SESEmailService;

  constructor() {
    this.sesService = SESEmailService.getInstance();
  }

  async sendOtpEmail(email: string, userName: string, otp: string): Promise<void> {
    const templatePath = path.join(process.cwd(), 'templates', 'otp-verification.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    htmlTemplate = htmlTemplate.replace('{{userName}}', userName);
    htmlTemplate = htmlTemplate.replace('{{otp}}', otp);

    await this.sesService.sendEmail(
      email,
      'Your OTP Verification Code',
      htmlTemplate
    );
  }
}