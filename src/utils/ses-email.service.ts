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

  public async createEmailTemplate(template: any) {
    const params = {
      Template: template,
    };
    let templates, res; 
    try {
      templates = await this.ses
        .getTemplate({
          TemplateName: template.TemplateName,
        })
        .promise();
      console.log(templates);
      res = await this.ses.updateTemplate(params).promise();
    } catch (e) {
      console.log(e);
      res = await this.ses.createTemplate(params).promise();
    }
    console.log(res);
  }

  public async deleteTemplate(templateName: string) {
    const params = {
      TemplateName: templateName,
    };
    this.ses.deleteTemplate(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  }
}
