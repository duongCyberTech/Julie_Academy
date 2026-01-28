/*
  Warnings:

  - You are about to drop the `Answer_for_exam` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `answer_set` to the `Question_for_exam_taken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ms_first_response` to the `Question_for_exam_taken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ms_total_response` to the `Question_for_exam_taken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answer_for_exam" DROP CONSTRAINT "Answer_for_exam_et_id_fkey";

-- DropForeignKey
ALTER TABLE "Answer_for_exam" DROP CONSTRAINT "Answer_for_exam_ques_id_aid_fkey";

-- AlterTable
ALTER TABLE "Question_for_exam_taken" ADD COLUMN     "answer_set" JSONB NOT NULL,
ADD COLUMN     "ms_first_response" BIGINT NOT NULL,
ADD COLUMN     "ms_total_response" BIGINT NOT NULL;

-- DropTable
DROP TABLE "Answer_for_exam";
