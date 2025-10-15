import { Controller, Get, Post, Body, Query, Param, Put, UseGuards, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionService } from './question.service';
import { AnswerDto, CategoryDto, QuestionDto } from './dto/question.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  createCategory(@Body() dto: CategoryDto[]){
    return this.questionService.createCategory(dto);
  }

  @Get()
  getAllCategories(@Query() query: any) {
    return this.questionService.getAllCategories(query.page, query.limit, query.search, query.grade, query.subject);
  }
}

@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post('create/:tutor_id')
    createQuestion(@Param('tutor_id') tutor_id: string, @Body() dto: QuestionDto[]) {
        return this.questionService.createQuestion(dto, tutor_id);
    }

    @Get('get')
    getAllQuestions(@Query() query: any) {
        return this.questionService.getAllQuestion(
            query.page, query.limit, query.search, 
            query.level, query.status, query.category_id
        );
    }

    @Get('get/category/:category_id')
    getQuestionsByCategory(@Param('category_id') category_id: string, @Query() query: any) {
        return this.questionService.getQuestionsByCategory(
            category_id, query.page, query.limit, query.search, 
            query.level, query.status
        );
    }

    @Get('get/my/:tutor_id')
    getMyQuestions(@Param('tutor_id') tutor_id: string, @Query() query: any) {
        return this.questionService.getMyQuestions(
            tutor_id, query.page, query.limit, query.search, 
            query.level, query.status, query.category_id
        );
    }

    @Get('get/detail/:ques_id')
    getQuestionDetail(@Param('ques_id') ques_id: string) {
        return this.questionService.getQuestionById(ques_id);
    }

    @Patch('update/ques/:ques_id')
    updateQuestion(@Param('ques_id') ques_id: string, @Body() dto: Partial<QuestionDto>) {
        return this.questionService.updateQuestion(ques_id, dto);
    }

    @Patch('update/answer/:ques_id/:aid')
    updateAnswer(@Param('ques_id') ques_id: string, @Param('aid') aid: number, @Body() dto: Partial<AnswerDto>) {
        return this.questionService.updateAnswer(aid, ques_id, dto);
    }
}
