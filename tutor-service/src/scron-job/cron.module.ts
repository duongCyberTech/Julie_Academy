import { Module, Res } from '@nestjs/common'
import { CronService } from './cron.service'
import { MailModule } from 'src/mail/mail.module'
import { ResourceModule } from 'src/resource/resource.module'

@Module({
  imports: [MailModule, ResourceModule],
  providers: [CronService],
})
export class CronModule {}