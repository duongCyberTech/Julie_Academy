import { Controller, Get, Post, Patch, Param, Query, Req, Body } from "@nestjs/common";
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
        @Body() exam: ExamDto
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

    @Post('create/session/:exam_id')
    createExamSession(

    ){

    }
}