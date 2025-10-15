import { isString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

enum QuestionStatus {
    PUBLIC = 'public',
    PRIVATE = 'private'
}
export class CategoryDto {
    @ApiProperty()
    category_name: string;
    @ApiProperty()
    description?: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updateAt: Date;
    @ApiProperty()
    grades: number;
    @ApiProperty()
    subject: string;
}

export class QuestionDto {
    @ApiProperty()
    content: string;
    @ApiProperty()
    explaination?: string;
    @ApiProperty()
    type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    @ApiProperty()
    level: 'easy' | 'medium' | 'hard';
    @ApiProperty()
    status: QuestionStatus;
    @ApiProperty()
    createAt: Date;
    @ApiProperty()
    updateAt: Date;
    @ApiProperty()
    category_id: string;
}

export class AnswerDto {
    @ApiProperty()
    aid: number;
    @ApiProperty()
    content: string;
    @ApiProperty()
    is_correct: boolean;
}