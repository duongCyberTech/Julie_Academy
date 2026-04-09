/*
  Warnings:

  - You are about to drop the column `template_name` on the `EmailConfig` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EmailTemplateType" AS ENUM ('public', 'private', 'custom');

-- AlterTable
ALTER TABLE "EmailConfig" DROP COLUMN "template_name",
ADD COLUMN     "template_id" TEXT,
ADD COLUMN     "time_to_send" TEXT NOT NULL DEFAULT '00:00';

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "template_id" TEXT NOT NULL,
    "type" "EmailTemplateType" NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("template_id")
);
