-- AlterTable
ALTER TABLE "Student_analytics" ALTER COLUMN "sum_exam_adaptive" DROP NOT NULL,
ALTER COLUMN "max_score_practice" DROP NOT NULL,
ALTER COLUMN "max_thread_comment" DROP NOT NULL,
ALTER COLUMN "sum_exam" DROP NOT NULL,
ALTER COLUMN "percentage_question_correct" DROP NOT NULL,
ALTER COLUMN "incre_percentage_question_correct" DROP NOT NULL,
ALTER COLUMN "streak" DROP NOT NULL,
ALTER COLUMN "last_exam_taken_date" DROP NOT NULL,
ALTER COLUMN "sign_up_date" DROP NOT NULL;
