/*
  Warnings:

  - The values [public,private] on the enum `QuestionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Books` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `status` on table `Questions` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cate_id` to the `Resources` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."QuestionAccess" AS ENUM ('private', 'public');

-- CreateEnum
CREATE TYPE "public"."PlanType" AS ENUM ('book', 'custom');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."QuestionStatus_new" AS ENUM ('draft', 'ready');
ALTER TABLE "public"."Questions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Questions" ALTER COLUMN "status" TYPE "public"."QuestionStatus_new" USING ("status"::text::"public"."QuestionStatus_new");
ALTER TYPE "public"."QuestionStatus" RENAME TO "QuestionStatus_old";
ALTER TYPE "public"."QuestionStatus_new" RENAME TO "QuestionStatus";
DROP TYPE "public"."QuestionStatus_old";
ALTER TABLE "public"."Questions" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Categories" DROP CONSTRAINT "fk_categories_books";

-- AlterTable
ALTER TABLE "public"."Question_of_exam" ALTER COLUMN "score" SET DATA TYPE DECIMAL(4,2);

-- AlterTable
ALTER TABLE "public"."Questions" ADD COLUMN     "accessMode" "public"."QuestionAccess" NOT NULL DEFAULT 'private',
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "public"."Resources" ADD COLUMN     "cate_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Books";

-- CreateTable
CREATE TABLE "public"."Review" (
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "rating" DECIMAL(3,1) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("student_id","class_id")
);

-- CreateTable
CREATE TABLE "public"."Badge" (
    "badge_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("badge_id")
);

-- CreateTable
CREATE TABLE "public"."Claim" (
    "student_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("student_id","badge_id")
);

-- CreateTable
CREATE TABLE "public"."Structure" (
    "plan_id" TEXT NOT NULL,
    "cate_id" TEXT NOT NULL,

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("plan_id","cate_id")
);

-- CreateTable
CREATE TABLE "public"."Lesson_Plan" (
    "plan_id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(20) NOT NULL,
    "grade" SMALLINT NOT NULL,
    "description" TEXT,
    "type" "public"."PlanType" NOT NULL DEFAULT 'custom',
    "tutor_id" TEXT NOT NULL,

    CONSTRAINT "Lesson_Plan_pkey" PRIMARY KEY ("plan_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_Plan_title_key" ON "public"."Lesson_Plan"("title");

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Claim" ADD CONSTRAINT "Claim_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Claim" ADD CONSTRAINT "Claim_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."Badge"("badge_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resources" ADD CONSTRAINT "Resources_cate_id_fkey" FOREIGN KEY ("cate_id") REFERENCES "public"."Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Structure" ADD CONSTRAINT "Structure_cate_id_fkey" FOREIGN KEY ("cate_id") REFERENCES "public"."Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Structure" ADD CONSTRAINT "Structure_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."Lesson_Plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson_Plan" ADD CONSTRAINT "Lesson_Plan_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "public"."Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
