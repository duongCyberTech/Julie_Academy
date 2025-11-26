import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { MailModule } from 'src/mail/mail.module'
import { MailService } from 'src/mail/mail.service'

@Module({
  imports: [PrismaModule, MailModule],
  providers: [CronService, MailService],
})
export class CronModule {}