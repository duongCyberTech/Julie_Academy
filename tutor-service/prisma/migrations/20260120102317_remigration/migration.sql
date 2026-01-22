/*
  Warnings:

  - Added the required column `badge_type` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `func_type` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threshold` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value_type` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."BadgeType" AS ENUM ('exam', 'exam_practice', 'exam_test', 'thread', 'thread_comment', 'question_correct', 'score', 'score_test', 'score_practice', 'streak');

-- CreateEnum
CREATE TYPE "public"."AggregateType" AS ENUM ('sum', 'avg', 'num', 'incre');

-- CreateEnum
CREATE TYPE "public"."ValueType" AS ENUM ('value', 'percent');

-- AlterTable
ALTER TABLE "public"."Badge" ADD COLUMN     "badge_type" "public"."BadgeType" NOT NULL,
ADD COLUMN     "badge_url" TEXT,
ADD COLUMN     "func_type" "public"."AggregateType" NOT NULL,
ADD COLUMN     "threshold" INTEGER NOT NULL,
ADD COLUMN     "value_type" "public"."ValueType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Claim" ADD COLUMN     "claim_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "claim_level" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Exam_open_in" ALTER COLUMN "ratio" DROP DEFAULT;
