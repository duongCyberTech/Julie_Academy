/*
  Warnings:

  - You are about to drop the column `ratio` on the `Exam_session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Exam_open_in" ADD COLUMN     "ratio" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Exam_session" DROP COLUMN "ratio";
