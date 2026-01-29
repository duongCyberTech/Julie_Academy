/*
  Warnings:

  - You are about to drop the `Model` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_student_id_fkey";

-- DropTable
DROP TABLE "Model";

-- CreateTable
CREATE TABLE "Student_analytics" (
    "ana_id" TEXT NOT NULL,
    "sum_exam_adaptive" INTEGER NOT NULL DEFAULT 0,
    "max_score_practice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "max_thread_comment" INTEGER NOT NULL DEFAULT 0,
    "sum_exam" INTEGER NOT NULL DEFAULT 0,
    "percentage_question_correct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "incre_percentage_question_correct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "last_exam_taken_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sign_up_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "Student_analytics_pkey" PRIMARY KEY ("ana_id")
);

-- AddForeignKey
ALTER TABLE "Student_analytics" ADD CONSTRAINT "Student_analytics_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
