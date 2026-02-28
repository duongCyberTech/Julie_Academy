import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';

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
import { BadgeModule } from './badge/badge.module';
import { ThreadModule } from './thread/thread.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';
import { BackgroundJobModule } from './background_job/background-job.module';

require('dotenv').config()

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, 
        limit: 50,  
      },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.UPSTASH_REDIS_HOST,
        port: process.env.UPSTASH_REDIS_PORT ? parseInt(process.env.UPSTASH_REDIS_PORT) : 6379,
        password: process.env.UPSTASH_REDIS_PASSWORD,
        username: 'default',
        tls: { rejectUnauthorized: false },
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    UserModule, 
    AuthModule, 
    ClassModule, 
    QuestionModule, 
    ExamModule, 
    DashboardModule, 
    CronModule, 
    MailModule, 
    ResourceModule,
    BadgeModule,
    ThreadModule,
    NotificationsModule,
    BackgroundJobModule
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
