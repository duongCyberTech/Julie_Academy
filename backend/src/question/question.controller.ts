import { 
    Controller, 
    Get, Post, 
    Body, Query, Param,
    UseGuards, Patch, Delete, 
    ParseIntPipe, BadRequestException 
} from '@nestjs/common'; 
import { AuthGuard } from '@nestjs/passport'; 
import { ControlMode } from 'src/mode/control.mode';
import { QuestionService, CategoryService, BookService } from './question.service';
import { AnswerDto, CategoryDto, QuestionDto, BookDto } from './dto/question.dto';
import { CreateAnswerDto, CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('books')
export class BookController {
    constructor(private readonly bookService: BookService){}

    @Post()
    createBook( @Body('book') book: BookDto[] ) {
        return this.bookService.createBook(book);
    }

    @Get()
    getBook(){
        return this.bookService.getAllBooks();
    }

    @Patch(':book_id')
    updateBook( @Param('book_id') book_id: string, @Body() dto: Partial<BookDto> ) {
        return this.bookService.updateBook(book_id, dto);
    }

    @Delete(':book_id')
    deleteBook( 
        @Param('book_id') book_id: string,
        @Query('mode') mode: ControlMode
    ) {
        return this.bookService.deleteBook(book_id, mode);
    }
}

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  createCategory(@Body() dto: CategoryDto[] ) {
    return this.categoryService.createCategory(dto);
  }

  @Get() 
  getAllCategories( 
    @Query() query: any 
  ) {
    return this.categoryService.getAllCategories(
        query?.mode, query?.book_id, query?.page, 
        query?.limit, query?.search, query?.grade, query?.subject
    );
  }

  @Patch(':category_id')
  updateCategory(@Param('category_id') category_id: string, @Body() dto: Partial<CategoryDto>) {
    return this.categoryService.updateCategory(category_id, dto);
  }

  @Delete(':category_id')
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
    createQuestion(@Param('tutor_id') tutor_id: string, @Body() dto: CreateQuestionDto[]) {
        return this.questionService.createQuestion(dto, tutor_id);
    }

    @Get('get')
    getAllQuestions(@Query() query: any) {
        return this.questionService.getAllQuestion(
            query?.page, query?.limit, query?.search,
            query?.level, query?.type, query?.status, 
            query?.category_id, query?.book_id 
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