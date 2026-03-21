/*
  Warnings:

  - You are about to alter the column `final_score` on the `Exam_taken` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(4,2)`.

*/
-- AlterTable
ALTER TABLE "Exam_taken" ALTER COLUMN "final_score" SET DEFAULT 0.00,
ALTER COLUMN "final_score" SET DATA TYPE DECIMAL(4,2);
