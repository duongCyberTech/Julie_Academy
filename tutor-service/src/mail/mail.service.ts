import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
    constructor(private readonly mailer: MailerService){}

    async sendEmail(to: string, subject: string, content: string){
        await this.mailer.sendMail({
            to,
            from: '"Julie Academy" <no-reply@gmail.com>',
            subject,
            html: content
        })
    }
}