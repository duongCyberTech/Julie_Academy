import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { QuestionEntity } from './entities/question.entity';

@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Req() req: any,
  ): Promise<QuestionEntity> {
    const creatorId = req.user.uid;
    return this.questionService.create(createQuestionDto, creatorId);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('level') level?: 'easy' | 'medium' | 'hard',
  ) {
    return this.questionService.findAll({ page, limit, level });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<QuestionEntity> {
    return this.questionService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<QuestionEntity> {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.questionService.remove(id);
  }
}
