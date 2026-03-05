import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ExamDto {
    @ApiProperty({ example: "Final Math Exam", description: "Exam Title" })
    @IsString()
    title: string;

    @ApiProperty({ description: "Description of exam - optional attribute" })
    @IsOptional()
    @IsString()
    description?: string

    @ApiProperty({ default: "easy", description: "Difficulty of Exam in one of three values(easy, medium, hard)" })
    @IsEnum(['easy', 'medium', 'hard'])
    level: 'easy' | 'medium' | 'hard';

    @ApiProperty({ description: "Maximum score of the exam" })
    @IsNumber()
    total_score: number;

    @ApiProperty()
    @IsNumber()
    duration: number

    @ApiProperty()
    @IsOptional()
    @IsDate()
    createdAt: Date;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    updateAt: Date;

    @ApiProperty()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    questionLst?: string[]; // list of question IDs
}

export class ExamSessionDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    session_id: number;

    @ApiProperty()
    @Type(() => Date)
    @IsDate()
    startAt: Date;

    @ApiProperty()
    @Type(() => Date)
    @IsDate()
    expireAt: Date;

    @ApiProperty()
    @IsEnum(['practice', 'test', 'final'])
    exam_type: 'practice' | 'test' | 'final';

    @ApiProperty()
    @IsNumber()
    limit_taken: number | 1;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    ratio: number | 0;
}

export class ExamTakenDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    final_score: number | 0;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    total_ques_completed: number | 0;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    startAt: Date;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    doneAt: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    exam_id: string | null;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    session_id: number | null;
}

export class SubmitAnswerDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    ques_id: string;

    @ApiProperty()
    @IsArray()
    @IsNumber({}, { each: true })
    answers: number[]; 

    @IsNumber()
    ms_first_response: number;

    @IsNumber()
    ms_total_response: number;

    @IsNumber()
    index: number;
}