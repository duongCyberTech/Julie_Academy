import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ClassModule } from './class/class.module';
import { QuestionModule } from './question/question.module';
import { ExamModule } from './exam/exam.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CronModule } from './scron-job/cron.module';
import { MailModule } from './mail/mail.module';
import { ResourceModule } from './resource/resource.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        // TTL: Time To Live (Thời gian) - 60 giây (1 phút)
        ttl: 60000, 
        // Limit: Số lượng request tối đa trong khoảng thời gian TTL
        limit: 10,  
      },
    ]),
    ScheduleModule.forRoot(),
    UserModule, AuthModule, ClassModule, 
    QuestionModule, ExamModule, DashboardModule, 
    CronModule, MailModule, ResourceModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService
  ],
})
export class AppModule {}
