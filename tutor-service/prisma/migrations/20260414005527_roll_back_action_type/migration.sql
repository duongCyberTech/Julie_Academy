/*
  Warnings:

  - You are about to drop the column `action_type` on the `ActionConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ActionConfig" DROP COLUMN "action_type";

-- DropEnum
DROP TYPE "ActionType";
