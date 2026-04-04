import { 
    Controller, Get, Post, Patch, 
    Param, Query, Req, Body, Search, 
    Request,
    InternalServerErrorException,
    UseGuards,
    ParseIntPipe,
    ParseDatePipe,
    ParseBoolPipe,
    DefaultValuePipe,
    ParseEnumPipe,
    UnauthorizedException
} from "@nestjs/common";
import { Request as Reqst } from "express";
import { ApiBody, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ExamService } from "./exam.service";
import { ExamTakenService } from "./exam_taken.service";
import { ExamDto, ExamSessionDto, ExamSessionStatus, ExamTakenDto, SubmitAnswerDto } from "./dto/exam.dto";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { ExceptionResponse } from "src/exception/Exception.exception";
import { IsEnum } from "class-validator/types/decorator/typechecker/IsEnum";
import { CurrentQuestionDto } from "./dto/adaptive.dto";

@Controller('exam')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamController {
    constructor(
        private readonly examService: ExamService
    ){}

    @Post('create/new/:tutor_id')
    @ApiBody({type: ExamDto})
    @ApiParam({
        name: "tutor_id",
        type: String
    })
    createExam(
        @Param('tutor_id') tutor_id,
        @Body() exam: Partial<ExamDto>
    ){
        return this.examService.createExam(exam, tutor_id);
    }

    @Post('add/question/:exam_id')
    @ApiParam({name: "exam_id", type: String})
    @ApiBody({type: [String]})
    addQuestionToExam(
        @Param('exam_id') exam_id: string,
        @Body('ques') ques: string[] 
    ){  
        return this.examService.addQuestionToExam(exam_id, ques);
    }

    @Post('remove/question/:exam_id')
    @ApiParam({name: "exam_id", type: String})
    @ApiBody({type: String})
    removeQuestionFromExam(
        @Param('exam_id') exam_id: string,
        @Body('ques_id') ques_id: string
    ){
        return this.examService.removeQuestionFromExam(exam_id, ques_id)
    }

    @Get('get')
    getAllExam(
        @Query() query: any
    ){
        return this.examService.getAllExams(query.number, query.limit, query.search, query.level)
    }

    @Get('get/tutor/:tutor_id')
    getExamByTutor(
        @Param('tutor_id') tutor_id: string,
        @Query() query: any
    ){
        return this.examService.getExamByTutor(tutor_id, query.page, query.limit, query.search, query.level)
    }

    @Get('get/detail/:exam_id')
    getDetailExam(
        @Param('exam_id') exam_id: string,
    ){
        return this.examService.getExamDetail(exam_id)
    }

    @Get('get/questions/:exam_id')
    getQuestionsOfExam(
        @Param('exam_id') exam_id: string
    ){
        return this.examService.getQuestionsOfExam(exam_id)
    }

    @Patch('update/:exam_id')
    updateExamMetaData(
        @Param('exam_id') exam_id: string,
        @Body() dto: Partial<ExamDto>
    ){
        return this.examService.updateExam(exam_id, dto)
    }
}

@Controller('exam/session')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamSessionController {
    constructor(private readonly examService: ExamService){}

    @Post('new/:exam_id')
    createExamSession(
        @Param('exam_id') exam_id: string,
        @Body('classLst') classes: string[],
        @Body('session') session: ExamSessionDto 
    ){
        return this.examService.createExamSession(exam_id, classes, session)
    }

    @Patch('update/:exam_id/:session_id')
    updateSession(
        @Param('exam_id') exam_id: string,
        @Param('session_id') session_id: number,
        @Body() data: Partial<ExamSessionDto>
    ){  
        return this.examService.updateSession(exam_id, session_id, data)
    }

    @Get('tutor')
    getAllSessionByTutor(
        @Request() req
    ){
        try {
            const tutor_id = req.user.userId
            const sessions = this.examService.getAllExamSessionByTutor(tutor_id)
            return sessions
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    @Get('class/:class_id')
    getAllSessionByClass(
        @Param('class_id') class_id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status', new DefaultValuePipe(ExamSessionStatus.OPEN), new ParseEnumPipe(ExamSessionStatus))
        status: ExamSessionStatus,
        @Request() req
    ){
        try {
            const user = req.user
            if (!user) return new UnauthorizedException("Unauthorized")
            return this.examService.getAllExamSessionByClass(user, class_id, page, limit, status)
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
    @Get('student/all')
    getAllSessionsForStudent(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status', new DefaultValuePipe(ExamSessionStatus.OPEN), new ParseEnumPipe(ExamSessionStatus))
        status: ExamSessionStatus,
        @Request() req
    ){
        try {
            const userId = req.user.userId;
            return this.examService.getAllExamSessionsForStudent(userId, page, limit, status);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}

@Controller('exam_taken')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamTakenController {
    constructor(
        private et_service: ExamTakenService
    ){}

    @Get("/class/:class_id/:exam_id/:session_id")
    takeExam(
        @Param("exam_id") exam_id: string,
        @Param("session_id", ParseIntPipe) session_id: number,
        @Param("class_id") class_id: string,
        @Request() req
    ){
        const userId = req.user.userId
        try {
            return this.et_service.takeExam(class_id, exam_id, session_id, userId);
        } catch (error) {
            return new ExceptionResponse().returnError(error);
        }
    }

    @Post(":et_id/class/:class_id")
    submitExam(
        @Param("et_id") et_id: string,
        @Param("class_id") class_id: string,
        @Body("submitAns") submitAns: SubmitAnswerDto[],
        @Body("isDone", ParseBoolPipe) isDone: boolean,
        @Request() req
    ){
        const userId = req.user.userId
        
        try {
            return this.et_service.submitExam(class_id, et_id, isDone, userId, submitAns);
        } catch (error) {
            return new ExceptionResponse().returnError(error);
        }
    }

    @Get("pending/:class_id")
    getAllPendingExamTaken(
        @Param("class_id") class_id: string,
        @Request() req
    ){
        const userId = req.user.userId
        try {
            return this.et_service.getAllPendingExamTaken(userId, class_id);
        } catch (error) {
            return new ExceptionResponse().returnError(error);
        }
    }

    @Get("continue/:et_id")
    continueTakeExam(
        @Param("et_id") et_id: string,
        @Request() req
    ){
        const userId = req.user.userId
        try {
            return this.et_service.continueTakeExam(et_id, userId);
        } catch (error) {
            return new ExceptionResponse().returnError(error);
        }
    }

    @Get("completed/:class_id")
    getCompletedExamTakens(
        @Param("class_id") class_id: string,
        @Request() req
    ){
        const userId = req.user.userId;
        try {
            return this.et_service.getCompletedExamTakens(userId, class_id);
        } catch (error) {
            return new ExceptionResponse().returnError(error);
        }
    }
}

@Controller('exam/adaptive')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdaptiveExamController {
    constructor(private et_service: ExamTakenService){}

    @Post('take/:category_id')
    takeAdaptiveExam(
        @Param('category_id') category: string,
        @Request() req
    ){
        const userId = req.user.userId;
        return this.et_service.takeAdaptiveExam(category, userId)
    }

    @Post('next-question/:category_id')
    getNextAdaptiveQuestion(
        @Param('category_id') category: string,
        @Body() cur_ques: CurrentQuestionDto,
        @Request() req
    ){
        const userId = req.user.userId;
        return this.et_service.getNextAdaptiveQuestion(userId, category, cur_ques)
    }

    @Post('submit/:et_id')
    submitAdaptiveExam(
        @Param('et_id') et_id: string,
        @Request() req
    ){
        const userId = req.user.userId;
        return this.et_service.submitAdaptiveExam(et_id, userId)
    }
}