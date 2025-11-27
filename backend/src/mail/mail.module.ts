import { Module } from "@nestjs/common";
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRoot({
      // Sử dụng Transport Configuration (SMTP)
      transport: {
        host: 'smtp.gmail.com', // Thay bằng host của bạn
        port: 587,
        secure: false, // true nếu port là 465, false nếu là 587
        auth: {
            user: 'themrz1404@gmail.com',
            pass: 'knrruzoubjxkryxc'
        }
      },
    }),
  ],
  controllers: [],
  providers: [MailService],
})
export class MailModule {}