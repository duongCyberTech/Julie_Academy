import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { BullAdapter } from "@bull-board/api/bullAdapter";

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
import { AnalysisModule } from './analysis/analysis.module';

require('dotenv').config()

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, 
        limit: 50,  
      },
    ]),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    // Đăng ký queue cụ thể vào dashboard
    BullBoardModule.forFeature({
      name: 'system-tasks-queue',
      adapter: BullAdapter, // Hoặc BullAdapter
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.UPSTASH_REDIS_HOST,
        port: process.env.UPSTASH_REDIS_PORT ? parseInt(process.env.UPSTASH_REDIS_PORT) : 6379,
        password: process.env.UPSTASH_REDIS_PASSWORD,
        ...(process.env.UPSTASH_REDIS_HOST !== 'redis' && {
          username: 'default',
          tls: { rejectUnauthorized: false },
        }),
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
    BackgroundJobModule,
    AnalysisModule
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
