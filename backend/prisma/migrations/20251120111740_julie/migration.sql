-- DropForeignKey
ALTER TABLE "public"."Lesson_Plan" DROP CONSTRAINT "Lesson_Plan_tutor_id_fkey";

-- AlterTable
ALTER TABLE "public"."Lesson_Plan" ALTER COLUMN "tutor_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Lesson_Plan" ADD CONSTRAINT "Lesson_Plan_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "public"."Tutor"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
