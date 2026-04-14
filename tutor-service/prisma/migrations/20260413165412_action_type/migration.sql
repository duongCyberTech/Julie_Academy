/*
  Warnings:

  - Added the required column `action_type` to the `ActionConfig` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('adaptive_learning', 'login', 'exam');

-- AlterTable
ALTER TABLE "ActionConfig" ADD COLUMN     "action_type" "ActionType" NOT NULL;
