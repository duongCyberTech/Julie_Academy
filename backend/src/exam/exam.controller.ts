import { Controller, Get, Post, Patch, Param, Query, Req, Body, Search } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ExamService } from "./exam.service";
import { ExamDto, ExamSessionDto, ExamTakenDto, SubmitAnswerDto } from "./dto/exam.dto";

@Controller('exam')
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
}