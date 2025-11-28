import { Injectable } from '@nestjs/common';
import { SESEmailService } from '../../utils/ses-email.service';

@Injectable()
export class MailService {
  private sesService: SESEmailService;

  constructor() {
    this.sesService = SESEmailService.getInstance();
  }

  async sendOtpEmail(email: string, userName: string, otp: string): Promise<void> {
    await this.sesService.sendTemplatedEmail(
      email,
      'otp-email',
      {
        headerLogo: process.env.EMAIL_HEADER_LOGO || 'https://via.placeholder.com/140x40.png',
        footerLogo: process.env.EMAIL_FOOTER_LOGO || 'https://via.placeholder.com/90x30.png',
        companyName: process.env.COMPANY_NAME || 'CyberSecure',
        subject: 'Your OTP Code',
        heading: 'OTP Verification',
        userName,
        message: 'We received a request to sign in to your account. Please use the following One-Time Password (OTP) to complete your login:',
        otp
      }
    );
  }

  async sendApplicationStatusEmail(
    email: string,
    userName: string,
    isApproved: boolean,
    rejectionReason?: string
  ): Promise<void> {
    if (isApproved) {
      await this.sesService.sendTemplatedEmail(
        email,
        'approval-email',
        {
          headerLogo: process.env.EMAIL_HEADER_LOGO || 'https://via.placeholder.com/140x40.png',
          footerLogo: process.env.EMAIL_FOOTER_LOGO || 'https://via.placeholder.com/90x30.png',

          companyName: process.env.COMPANY_NAME || 'CyberSecure',

          subject: 'Application Approved',

          heading: 'Application Status Update',

          userName,

          message: `Thank you for showing interest in the CyberSecure program run by Yottabyte. <br><br>
                    We are glad to inform you that your application has been <strong>reviewed</strong> and <strong>accepted</strong>.`,

          details: [
            'Log in to your account using your registered email.',
            'View your assigned batch to see your schedule and important details.',
            'Review and update your profile information.'
          ],

          callToAction: `${process.env.FRONTEND_URL}/auth/sign-in`,
          ctaText: 'Go to Login'
        }
      );
    } else {
      await this.sesService.sendTemplatedEmail(
        email,
        'rejection-email',
        {
          headerLogo: process.env.EMAIL_HEADER_LOGO || 'https://via.placeholder.com/140x40.png',
          footerLogo: process.env.EMAIL_FOOTER_LOGO || 'https://via.placeholder.com/90x30.png',

          companyName: process.env.COMPANY_NAME || 'CyberSecure',

          subject: 'Application Rejected',

          heading: 'Application Status Update',

          userName,  

          message: rejectionReason || `Thank you for showing interest in the CyberSecure program run by Yottabyte.<br><br>
            We have <strong>reviewed</strong> your application; however, we are unable to move forward at this time.<br><br>
            We encourage you to continue growing your skills and experience. You are welcome to reapply in the future.`
        }
      );
    }
  }
}