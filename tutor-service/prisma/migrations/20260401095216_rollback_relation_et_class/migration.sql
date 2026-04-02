/*
  Warnings:

  - You are about to drop the column `class_id` on the `Exam_taken` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exam_taken" DROP CONSTRAINT "Exam_taken_class_id_fkey";

-- AlterTable
ALTER TABLE "Exam_taken" DROP COLUMN "class_id";
