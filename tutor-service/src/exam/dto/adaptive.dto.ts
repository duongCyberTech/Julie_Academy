import { DifficultyLevel, QuestionStatus, QuestionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CurrentQuestionDto {
    @IsUUID()
    et_id: string;

    @IsString()
    question_id: string;

    @IsOptional()
    @IsBoolean()
    is_correct: boolean = false;

    @Type(() => Number)
    @IsNumber()
    index: number;

    @IsEnum(DifficultyLevel)
    level: DifficultyLevel;

    @IsArray()
    @IsNumber({}, { each: true })
    answers: number[]; 

    @IsOptional()
    @IsDate()
    chosen_answer_at?: Date | null;
}