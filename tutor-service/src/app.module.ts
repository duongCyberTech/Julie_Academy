import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
import { ConfigModule } from '@nestjs/config';
import rabbitmqConfig from './config/rabbitmq.config';

import { BackgroundService } from './background_job/BackgroundJob.service';
import { S3Service } from './resource/aws/aws-s3.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [rabbitmqConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, 
        limit: 50,  
      },
    ]),
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
    ThreadModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    BackgroundService,
    S3Service,
    AppService
  ],
})
export class AppModule {}
