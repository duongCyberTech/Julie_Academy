import { Type } from 'class-transformer';
import { QuestionStatus, QuestionAccess } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';
enum DifficultyLevel {
  easy = 'easy',
  medium = 'medium',
  hard = 'hard',
}

enum QuestionType {
  single_choice = 'single_choice',
  multiple_choice = 'multiple_choice',
  true_false = 'true_false',
  short_answer = 'short_answer',
  essay = 'essay',
}

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsBoolean()
  isCorrect: boolean;
  @IsOptional()
  @IsString()
  explaination?: string;
}

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(DifficultyLevel)
  level: DifficultyLevel;

  @IsString()
  @IsOptional()
  explaination?: string;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];

  @IsOptional()
  @IsEnum(QuestionAccess)
  accessMode?: QuestionAccess;

  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;
}