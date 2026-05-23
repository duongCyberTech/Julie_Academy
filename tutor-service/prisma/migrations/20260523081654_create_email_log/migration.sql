-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('success', 'failure');

-- CreateTable
CREATE TABLE "EmailLogs" (
    "log_id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "LogStatus" NOT NULL DEFAULT 'success',
    "error_message" JSONB DEFAULT '[]',

    CONSTRAINT "EmailLogs_pkey" PRIMARY KEY ("log_id")
);

-- AddForeignKey
ALTER TABLE "EmailLogs" ADD CONSTRAINT "EmailLogs_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "EmailConfig"("config_id") ON DELETE CASCADE ON UPDATE CASCADE;
