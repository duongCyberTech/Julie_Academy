/*
  Warnings:

  - Added the required column `title` to the `Questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Questions" DROP CONSTRAINT "Questions_category_id_fkey";

-- AlterTable
ALTER TABLE "public"."Class" ADD COLUMN     "plan_id" TEXT;

-- AlterTable
ALTER TABLE "public"."Exam_session" ADD COLUMN     "ratio" INTEGER;

-- AlterTable
ALTER TABLE "public"."Questions" ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "category_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."Lesson_Plan"("plan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Questions" ADD CONSTRAINT "Questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;
