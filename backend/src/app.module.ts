import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'; // Cần import thêm 'join' để xử lý đường dẫn

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
    // Cấu hình để serve file tĩnh (ảnh avatar) từ thư mục 'uploads'
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Đường dẫn đến thư mục chứa ảnh
      serveRoot: '/uploads', // Tiền tố URL để truy cập (vd: http://localhost:3000/uploads/avatar.jpg)
    }),
    ThrottlerModule.forRoot([
      {
        // TTL: Time To Live (Thời gian) - 60 giây (1 phút)
        ttl: 60000, 
        // Limit: Số lượng request tối đa trong khoảng thời gian TTL
        limit: 100,  
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
