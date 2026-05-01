import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { MailObjectDto } from "./dto/mail.dto";
import { PdfService } from "src/resource/pdf/pdf.service";

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private pdf: PdfService
  ){}

  async sendEmail(data: MailObjectDto){
    const { from, to, subject, content, fileContent } = data
    let is_attachment = false
    let fileBuffer: Buffer | undefined

    if (fileContent) {
      is_attachment = true
      fileBuffer = Buffer.from(fileContent, 'base64')
    }

    await this.mailer.sendMail({
      to,
      from,
      subject,
      html: content,
      ...(is_attachment && fileBuffer ? {
        attachments: [
          {
            filename: 'report.pdf',
            content: fileBuffer,
            contentType: 'application/pdf',
          }
        ]
      } : {})
    })
  }
}