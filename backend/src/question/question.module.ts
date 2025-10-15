import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController, CategoryController } from './question.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionController, CategoryController],
  providers: [QuestionService],
})
export class QuestionModule {}
