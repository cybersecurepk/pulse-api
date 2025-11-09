import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendOtpEmail(email: string, userName: string, otp: string): Promise<void> {
    const templatePath = path.join(process.cwd(), 'templates', 'otp-verification.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    htmlTemplate = htmlTemplate.replace('{{userName}}', userName);
    htmlTemplate = htmlTemplate.replace('{{otp}}', otp);

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"01HRMS" <noreply@01hrms.com>',
      to: email,
      subject: 'Your OTP Verification Code',
      html: htmlTemplate,
    });
  }
}
