import { ApiProperty } from '@nestjs/swagger'

export class ExamDto {
    @ApiProperty({ example: "Final Math Exam", description: "Exam Title" })
    title: string;
    @ApiProperty({ description: "Description of exam - optional attribute" })
    description?: string
    @ApiProperty({ default: "easy", description: "Difficulty of Exam in one of three values(easy, medium, hard)" })
    level: 'easy' | 'medium' | 'hard';
    @ApiProperty({ description: "Maximum score of the exam" })
    total_score: number;
    @ApiProperty()
    duration: number
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updateAt: Date;
    @ApiProperty()
    questionLst: string[]; // list of question IDs
}

export class ExamSessionDto {
    @ApiProperty()
    session_id: number;
    @ApiProperty()
    startAt: Date;
    @ApiProperty()
    expireAt: Date;
    @ApiProperty()
    exam_type: 'practice' | 'test' | 'final';
    @ApiProperty()
    limit_taken: number | 1;
}

export class ExamTakenDto {
    @ApiProperty()
    final_score: number | 0;
    @ApiProperty()
    total_ques_completed: number | 0;
    @ApiProperty()
    startAt: Date;
    @ApiProperty()
    doneAt: Date;
    @ApiProperty()
    exam_id: string | null;
    @ApiProperty()
    session_id: number | null;
}

export class SubmitAnswerDto {
    @ApiProperty()
    ques_id: string;
    @ApiProperty()
    answer: number | number[]; 
}