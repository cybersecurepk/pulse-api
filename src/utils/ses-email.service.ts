import { SESClient } from '@aws-sdk/client-ses';
import { SES } from 'aws-sdk';

export class SESEmailService {
  private static instance: SESEmailService;
  private ses: SES;
  private sesClient: SESClient;

  private constructor() {
    // Validate required environment variables
    if (!process.env.AWS_SES_ACCESS_KEY_ID) {
      throw new Error('AWS_SES_ACCESS_KEY_ID environment variable is required');
    }
    if (!process.env.AWS_SES_ACCESS_KEY_SECRET) {
      throw new Error('AWS_SES_ACCESS_KEY_SECRET environment variable is required');
    }
    if (!process.env.AWS_SES_REGION) {
      throw new Error('AWS_SES_REGION environment variable is required');
    }
    if (!process.env.AWS_SES_FROM_EMAIL) {
      throw new Error('AWS_SES_FROM_EMAIL environment variable is required');
    }

    this.ses = new SES({
      apiVersion: '2010-12-01',
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SES_ACCESS_KEY_SECRET,
      region: process.env.AWS_SES_REGION
    });
    
    this.sesClient = new SESClient({
      apiVersion: '2010-12-01',
      region: process.env.AWS_SES_REGION
    });
  }

  static getInstance(): SESEmailService {
    if (!SESEmailService.instance) {
      SESEmailService.instance = new SESEmailService();
    }
    return SESEmailService.instance;
  }

  public async sendEmail(
    email: string,
    subject: string,
    htmlContent: string
  ): Promise<any> {
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlContent,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: process.env.AWS_SES_FROM_EMAIL || '"01HRMS" <noreply@01hrms.com>'
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      console.log('Email sent successfully:', result.MessageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  public async sendTemplatedEmail(
    email: string,
    templateName: string,
    data: any
  ): Promise<any> {
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Template: templateName,
      TemplateData: JSON.stringify(data),
      Source: process.env.AWS_SES_FROM_EMAIL || '"01HRMS" <noreply@01hrms.com>',
    };

    await this.ses
      .sendTemplatedEmail(params)
      .promise()
      .then(function (data) {
        console.log(data);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  }

  public async createEmailTemplate(template: {
    TemplateName: string;
    SubjectPart: string;
    HtmlPart: string;
    TextPart?: string;
  }): Promise<any> {
    const params = {
      Template: {
        TemplateName: template.TemplateName,
        SubjectPart: template.SubjectPart,
        HtmlPart: template.HtmlPart,
        ...(template.TextPart && { TextPart: template.TextPart }),
      },
    };

    try {
      // Check if template already exists
      await this.ses
        .getTemplate({
          TemplateName: template.TemplateName,
        })
        .promise();
      
      // Template exists, update it
      try {
        const result = await this.ses.updateTemplate(params).promise();
        console.log('Template updated successfully:', template.TemplateName);
        return { success: true, message: 'Template updated successfully', data: result };
      } catch (updateError: any) {
        // Extract meaningful error message
        const errorMessage = this.extractErrorMessage(updateError);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      // Template doesn't exist (error code: 'TemplateDoesNotExist'), create it
      if (error.code === 'TemplateDoesNotExist' || error.statusCode === 404) {
        try {
          const result = await this.ses.createTemplate(params).promise();
          console.log('Template created successfully:', template.TemplateName);
          return { success: true, message: 'Template created successfully', data: result };
        } catch (createError: any) {
          // Extract meaningful error message
          const errorMessage = this.extractErrorMessage(createError);
          throw new Error(errorMessage);
        }
      }
      // Other errors, extract and throw meaningful message
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  private extractErrorMessage(error: any): string {
    // AWS SDK v2 error structure
    const errorCode = error.code || error.name;
    let errorMessage = error.message || error.errorMessage || error.Message || 'Unknown error';
    
    // Try to extract more detailed error info from AWS response
    if (error.originalError) {
      errorMessage = error.originalError.message || errorMessage;
    }
    
    // Handle Handlebars compilation errors specifically
    if (errorCode === 'InvalidTemplate') {
      if (errorMessage.includes('Handlebars') || errorMessage.includes('compilation')) {
        // Build comprehensive error message with common fixes
        let detailedMessage = `Invalid template syntax: ${errorMessage}\n\n`;
        detailedMessage += `Common Handlebars syntax issues to check:\n`;
        detailedMessage += `1. Unmatched braces - Ensure all {{#if}} have {{/if}}, {{#each}} have {{/each}}\n`;
        detailedMessage += `2. Variable names - Use {{variableName}} (no spaces, use camelCase)\n`;
        detailedMessage += `3. Nested blocks - Close inner blocks before outer blocks\n`;
        detailedMessage += `4. Special characters - Escape HTML entities if needed\n`;
        detailedMessage += `5. Subject line - Can use {{variable}} in SubjectPart\n\n`;
        detailedMessage += `Valid examples:\n`;
        detailedMessage += `- Variables: {{userName}}, {{companyName}}\n`;
        detailedMessage += `- Conditionals: {{#if condition}}content{{/if}}\n`;
        detailedMessage += `- Loops: {{#each items}}{{this}}{{/each}}\n`;
        detailedMessage += `- Nested: {{#if items}}{{#each items}}{{this}}{{/each}}{{/if}}`;
        
        return detailedMessage;
      }
      return `Invalid template: ${errorMessage}`;
    }
    
    // Handle template name errors
    if (errorCode === 'InvalidTemplateName') {
      return `Invalid template name: ${errorMessage}. Template names must be 1-64 characters and contain only alphanumeric characters, hyphens, and underscores.`;
    }
    
    // Handle other AWS errors
    if (errorCode) {
      return `AWS SES Error (${errorCode}): ${errorMessage}`;
    }
    
    // Fallback
    return errorMessage || 'An unknown error occurred while creating/updating the template';
  }

  public async deleteTemplate(templateName: string): Promise<any> {
    const params = {
      TemplateName: templateName,
    };

    try {
      const result = await this.ses.deleteTemplate(params).promise();
      console.log('Template deleted successfully:', templateName);
      return { success: true, message: 'Template deleted successfully', data: result };
    } catch (error: any) {
      // Handle case where template doesn't exist
      if (error.code === 'TemplateDoesNotExist' || error.statusCode === 404) {
        throw new Error(`Template '${templateName}' does not exist`);
      }
      // Extract and throw meaningful error message
      const errorMessage = error.message || error.errorMessage || error.Message || 'Failed to delete template';
      throw new Error(errorMessage);
    }
  }
}
