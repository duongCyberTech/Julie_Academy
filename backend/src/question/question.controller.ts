import { 
    Controller, 
    Get, Post, 
    Body, Query, Param,
    UseGuards, Patch, Delete, 
    ParseIntPipe, BadRequestException 
} from '@nestjs/common'; 
import { AuthGuard } from '@nestjs/passport'; 
import { ControlMode } from 'src/mode/control.mode';
import { QuestionService, CategoryService, LessonPlanService } from './question.service';
import { AnswerDto, CategoryDto, QuestionDto, LessonPlanDto } from './dto/question.dto';
import { CreateAnswerDto, CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookController {
    constructor(private readonly bookService: LessonPlanService){}

    @Post()
    @Roles('admin')
    createLessonPlan( @Body() book: LessonPlanDto[] ) {
        return this.bookService.createLessonPlan(book);
    }

    @Post(':tutor_id')
    @Roles('tutor')
    createLessonPlanByTutor( 
        @Body() book: LessonPlanDto[],
        @Param('tutor_id') tutor_id: string 
    ) {
        return this.bookService.createLessonPlan(book, tutor_id);
    }

    @Get()
    @Roles('admin')
    getAllLessonPlan(){
        return this.bookService.getAllPlans();
    }

    @Get(':tutor_id')
    @Roles('tutor')
    getLessonPlanByTutor(@Param('tutor_id') tutor_id: string){
        return this.bookService.getAllPlans(tutor_id);
    }

    @Patch(':plan_id')
    @Roles('admin', 'tutor')
    updateBook( @Param('plan_id') plan_id: string, @Body() dto: Partial<LessonPlanDto> ) {
        return this.bookService.updatePlan(plan_id, dto);
    }

    @Delete(':plan_id')
    @Roles('admin', 'tutor')
    deleteBook( 
        @Param('plan_id') plan_id: string,
        @Query('mode') mode: ControlMode
    ) {
        return this.bookService.deletePlan(plan_id, mode);
    }
}

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles('tutor', 'admin')
  createCategory(@Body() dto: CategoryDto[] ) {
    return this.categoryService.createCategory(dto);
  }

  @Get() 
  @Roles('tutor', 'admin')
  getAllCategories( 
    @Query() query: any 
  ) {
    return this.categoryService.getAllCategories(
        query?.mode, query?.plan_id, query?.page, 
        query?.limit, query?.search, query?.grade, query?.subject
    );
  }

  @Patch(':category_id')
  @Roles('tutor', 'admin')
  updateCategory(@Param('category_id') category_id: string, @Body() dto: Partial<CategoryDto>) {
    return this.categoryService.updateCategory(category_id, dto);
  }

  @Delete(':category_id')
  @Roles('tutor', 'admin')
  deleteCategory( 
    @Param('category_id') category_id: string,
    @Query('mode') mode: ControlMode
  ) {
    return this.categoryService.deleteCategory(category_id, mode);
  }
}

@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post('create/:tutor_id')
    @Roles('tutor')
    createQuestion(@Param('tutor_id') tutor_id: string, @Body() dto: CreateQuestionDto[]) {
        return this.questionService.createQuestion(dto, tutor_id);
    }

    @Get('get')
    getAllQuestions(@Query() query: any) {
        return this.questionService.getAllQuestion(
            query?.page, query?.limit, query?.search,
            query?.level, query?.type, query?.status, 
            query?.category_id, query?.plan_id
        );
    }

    @Get('get/category/:category_id')
    getQuestionsByCategory(@Param('category_id') category_id: string, @Query() query: any) {
        return this.questionService.getQuestionsByCategory(
            category_id, query?.page, query?.limit, query?.search,
            query?.level, query?.type 
        );
    }

    @Get('get/my/:tutor_id')
    getMyQuestions(@Param('tutor_id') tutor_id: string, @Query() query: any) {
        return this.questionService.getMyQuestions(
            tutor_id, query?.page, query?.limit, query?.search,
            query?.level, query?.type, query?.status, query?.category_id
        );
    }
    @Get('get/detail/:ques_id')
    getQuestionDetail(@Param('ques_id') ques_id: string) {
        return this.questionService.getQuestionById(ques_id);
    }

    @Patch('update/ques/:ques_id')
    updateQuestion(@Param('ques_id') ques_id: string, @Body() dto: UpdateQuestionDto) {
        return this.questionService.updateQuestion(ques_id, dto);
    }

    @Patch('update/answer/:ques_id/:aid')
    updateAnswer(
        @Param('ques_id') ques_id: string,
        @Param('aid', ParseIntPipe) aid: number, // Dùng ParseIntPipe
        @Body() dto: Partial<AnswerDto>
    ) {
        return this.questionService.updateAnswer(aid, ques_id, dto);
    }
    @Delete('delete/question/:ques_id')
    deleteQuestion( @Param('ques_id') ques_id: string ) {
        return this.questionService.deleteQuestion(ques_id);
    }

    @Post('add/answer/:ques_id')
    addAnswer( @Param('ques_id') ques_id: string, @Body() dto: CreateAnswerDto[] ) {
        return this.questionService.addAnswer(dto, ques_id);
    }

    @Delete('delete/answer/:ques_id/:aid')
    deleteAnswer(
        @Param('ques_id') ques_id: string,
        @Param('aid', ParseIntPipe) aid: number 
    ) {
        return this.questionService.deleteAnswer(aid, ques_id);
    }
}