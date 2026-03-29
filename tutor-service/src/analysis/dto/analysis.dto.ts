import { 
    IsDate,
    IsInt, 
    IsNumber,
    IsUUID
} from "class-validator";

enum UpdateAnalyticsType {
    replace = "replace",
    increase = "increase"
}

export class AnalyticsDto {
    @IsInt()
    sum_exam_adaptive: number;

    @IsInt()
    max_score_practice: number;

    @IsInt()
    max_thread_comment: number;

    @IsInt()
    sum_exam: number;

    @IsNumber()
    percentage_question_correct: number;

    @IsNumber()
    incre_percentage_question_correct: number;

    @IsInt()
    streak: number;

    @IsDate()
    last_exam_taken_date: Date;

    @IsDate()
    sign_up_date: Date;
}