import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { UserMailDto } from "./dto/user.dto";

@Injectable()
export class MailService {
    constructor(private readonly mailer: MailerService){}

    async sendEmail(subject: string, content: string){
        await this.mailer.sendMail({
            to: "duong.maibk106khmt@hcmut.edu.vn",
            from: '"Julie Academy" <no-reply@gmail.com>',
            subject: subject,
            text: content
        })
    }
}