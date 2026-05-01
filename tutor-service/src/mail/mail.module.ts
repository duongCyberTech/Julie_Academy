import { Module } from "@nestjs/common";
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from "./mail.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ResourceModule } from "src/resource/resource.module";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: config.get('MAIL_SECURE') === 'true',
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"Julie Academy" <${config.get('MAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    ResourceModule
  ],
  controllers: [],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}