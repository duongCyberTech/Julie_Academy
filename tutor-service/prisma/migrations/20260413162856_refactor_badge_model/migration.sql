/*
  Warnings:

  - You are about to drop the column `incre_percentage_question_correct` on the `Student_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `last_exam_taken_date` on the `Student_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `max_score_practice` on the `Student_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `max_thread_comment` on the `Student_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `percentage_question_correct` on the `Student_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `sign_up_date` on the `Student_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `streak` on the `Student_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `sum_exam` on the `Student_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `sum_exam_adaptive` on the `Student_analytics` table. All the data in the column will be lost.
  - You are about to drop the `Badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Claim` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_badge_id_fkey";

-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_student_id_fkey";

-- AlterTable
ALTER TABLE "Student_analytics" DROP COLUMN "incre_percentage_question_correct",
DROP COLUMN "last_exam_taken_date",
DROP COLUMN "max_score_practice",
DROP COLUMN "max_thread_comment",
DROP COLUMN "percentage_question_correct",
DROP COLUMN "sign_up_date",
DROP COLUMN "streak",
DROP COLUMN "sum_exam",
DROP COLUMN "sum_exam_adaptive",
ADD COLUMN     "curent_level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "water_drops" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Badge";

-- DropTable
DROP TABLE "Claim";

-- DropEnum
DROP TYPE "AggregateType";

-- DropEnum
DROP TYPE "BadgeType";

-- DropEnum
DROP TYPE "ValueType";

-- CreateTable
CREATE TABLE "LevelConfig" (
    "level" SERIAL NOT NULL,
    "exp_required" INTEGER NOT NULL,

    CONSTRAINT "LevelConfig_pkey" PRIMARY KEY ("level")
);

-- CreateTable
CREATE TABLE "ActionConfig" (
    "action_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "drops_claim" INTEGER NOT NULL,

    CONSTRAINT "ActionConfig_pkey" PRIMARY KEY ("action_id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "config_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("config_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LevelConfig_level_key" ON "LevelConfig"("level");

-- CreateIndex
CREATE UNIQUE INDEX "ActionConfig_title_key" ON "ActionConfig"("title");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");
