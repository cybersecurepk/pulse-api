import { Injectable, UnprocessableEntityException, BadRequestException } from '@nestjs/common';
import type { Multer } from 'multer';
import { SESEmailService } from '../../utils/ses-email.service';

@Injectable()
export class MailService {
  private sesService: SESEmailService;

  constructor() {
    this.sesService = SESEmailService.getInstance();
  }

  async createEmailTemplate(
    template: Multer.File,
    body: { name: string; subject: string },
  ) {
    // Validate file
    if (!template) {
      throw new UnprocessableEntityException('Template file is required');
    }

    // Validate MIME type (HTML files)
    if (template.mimetype !== 'text/html') {
      throw new UnprocessableEntityException('Template must be an HTML file');
    }

    // Validate required fields
    if (!body.name || !body.subject) {
      throw new UnprocessableEntityException(
        'Template name and subject are required',
      );
    }

    // Convert buffer to string
    const htmlBody = template.buffer.toString('utf-8');

    // Validate HTML content is not empty
    if (!htmlBody.trim()) {
      throw new UnprocessableEntityException('Template file cannot be empty');
    }

    // Basic Handlebars syntax validation
    const validationError = this.validateHandlebarsSyntax(htmlBody, body.subject);
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    // Prepare template options for AWS SES
    const templateOptions = {
      TemplateName: body.name,
      SubjectPart: body.subject,
      HtmlPart: htmlBody,
    };

    try {
      // Create or update template on AWS SES
      return await this.sesService.createEmailTemplate(templateOptions);
    } catch (error: any) {
      // Convert AWS SES errors to user-friendly exceptions
      const errorMessage = error.message || 'Failed to create/update email template';
      
      // Check for template validation errors (BadRequest)
      if (errorMessage.includes('Invalid template') || errorMessage.includes('Handlebars')) {
        throw new BadRequestException(errorMessage);
      }
      
      // Other errors as UnprocessableEntity
      throw new UnprocessableEntityException(errorMessage);
    }
  }

  async sendOtpEmail(email: string, userName: string, otp: string): Promise<void> {
    await this.sesService.sendTemplatedEmail(
      email,
      'otp-verification-template',
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

  /**
   * Basic validation for Handlebars syntax in templates
   * Checks for common issues like unmatched braces
   */
  private validateHandlebarsSyntax(htmlContent: string, subject: string): string | null {
    const content = htmlContent + subject; // Check both HTML and subject
    
    // Check for unmatched opening/closing braces
    const openingBlocks: string[] = [];
    const blockRegex = /\{\{#(\w+)(?:\s+[^}]+)?\}\}/g;
    const closingRegex = /\{\{\/(\w+)\}\}/g;
    
    let match;
    
    // Find all opening blocks
    while ((match = blockRegex.exec(content)) !== null) {
      openingBlocks.push(match[1]);
    }
    
    // Find all closing blocks and match them
    while ((match = closingRegex.exec(content)) !== null) {
      const closingTag = match[1];
      const lastOpening = openingBlocks.pop();
      
      if (!lastOpening) {
        return `Found closing tag {{/${closingTag}}} without matching opening tag. Check for extra closing tags.`;
      }
      
      if (lastOpening !== closingTag) {
        return `Mismatched Handlebars tags: expected {{/${lastOpening}}} but found {{/${closingTag}}}. Ensure all blocks are properly closed.`;
      }
    }
    
    // Check for unmatched opening blocks
    if (openingBlocks.length > 0) {
      return `Unclosed Handlebars blocks found: ${openingBlocks.map(tag => `{{#${tag}}}`).join(', ')}. Ensure all blocks have matching closing tags ({{/${openingBlocks[0]}}}).`;
    }
    
    // Check for invalid variable syntax (spaces in variable names)
    const invalidVarRegex = /\{\{\s*[^#\/][^}]*\s+[^}]*\}\}/;
    if (invalidVarRegex.test(content)) {
      return 'Invalid Handlebars variable syntax detected. Variables should use camelCase without spaces, e.g., {{userName}} not {{user name}}.';
    }
    
    return null; // No errors found
  }

  async deleteEmailTemplate(templateName: string) {
    // Validate template name
    if (!templateName || !templateName.trim()) {
      throw new BadRequestException('Template name is required');
    }

    try {
      // Delete template on AWS SES
      return await this.sesService.deleteTemplate(templateName.trim());
    } catch (error: any) {
      // Convert AWS SES errors to user-friendly exceptions
      const errorMessage = error.message || 'Failed to delete email template';
      
      // Check for template not found errors (NotFound)
      if (errorMessage.includes('does not exist') || errorMessage.includes('TemplateDoesNotExist')) {
        throw new BadRequestException(errorMessage);
      }
      
      // Other errors as UnprocessableEntity
      throw new UnprocessableEntityException(errorMessage);
    }
  }
}