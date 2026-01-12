import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  Body,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Public } from '../../decorator/isPublic';
import { MailService } from './mail.service';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Post('create-email-template')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create or update an email template on AWS SES' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Template name (unique identifier)',
          example: 'welcome-email',
        },
        subject: {
          type: 'string',
          description: 'Email subject line',
          example: 'Welcome to {{companyName}}',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'HTML template file',
        },
      },
      required: ['name', 'subject', 'file'],
    },
  })
  async createEmailTemplate(
    @UploadedFile() template: Multer.File,
    @Body() body: { name: string; subject: string },
  ) {
    return await this.mailService.createEmailTemplate(template, body);
  }

  @Public()
  @Delete('delete-email-template/:templateName')
  @ApiOperation({ summary: 'Delete an email template from AWS SES' })
  @ApiParam({
    name: 'templateName',
    type: 'string',
    description: 'Name of the template to delete',
    example: 'welcome-email',
  })
  async deleteEmailTemplate(@Param('templateName') templateName: string) {
    return await this.mailService.deleteEmailTemplate(templateName);
  }
}

