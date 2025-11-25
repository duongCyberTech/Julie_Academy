import { Module } from '@nestjs/common';
import { QuestionService, CategoryService, LessonPlanService } from './question.service';
import { QuestionController, CategoryController, BookController } from './question.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionController, CategoryController, BookController],
  providers: [QuestionService, CategoryService, LessonPlanService],
})
export class QuestionModule {}
