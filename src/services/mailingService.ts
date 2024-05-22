import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class MailingService {
  private transporter: nodemailer.Transporter;
  private confirmationTemplate: handlebars.TemplateDelegate;
  private passwordResetTemplate: handlebars.TemplateDelegate;
  private groupInviteTemplate: handlebars.TemplateDelegate;

  constructor() {
    this.transporter = nodemailer.createTransport(
      {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAILER_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      {
        from: {
          name: 'No-reply',
          address: process.env.MAIL_FROM,
        },
      },
    );

    this.confirmationTemplate = this.loadTemplate('confirmation.hbs');
    this.passwordResetTemplate = this.loadTemplate('recoverPassword.hbs');
  }

  private loadTemplate(templateName: string): handlebars.TemplateDelegate {
    const templatesFolderPath = join(__dirname, '../../templates');
    const templatePath = join(templatesFolderPath, templateName);

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  }

  async sendUserConfirmation(user: any, token: string) {
    const url = `${process.env.CLIENT_URL}?token=${token}`;
    const html = this.confirmationTemplate({ name: user.firstName, url });

    await this.transporter.sendMail({
      to: user.email,
      subject: 'Welcome user! Confirm your Email',
      html: html,
    });
  }

  async sendRecoverPassword(user: any, token: string) {
    const url = `${process.env.CLIENT_URL}?token=${token}`;
    const html = this.passwordResetTemplate({ name: user.firstName, url });

    await this.transporter.sendMail({
      to: user.email,
      subject: 'Recuperação de senha',
      html: html,
    });
  }
}
