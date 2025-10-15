import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ClassModule } from './class/class.module';
import { QuestionModule } from './question/question.module';
import { ExamModule } from './exam/exam.module';

@Module({
  imports: [UserModule, AuthModule, ClassModule, QuestionModule, ExamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
