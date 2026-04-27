-- CreateEnum
CREATE TYPE "EmailObjective" AS ENUM ('personal', 'all');

-- AlterTable
ALTER TABLE "EmailConfig" ADD COLUMN     "send_to" "EmailObjective" NOT NULL DEFAULT 'all';

-- CreateTable
CREATE TABLE "Receivers" (
    "config_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,

    CONSTRAINT "Receivers_pkey" PRIMARY KEY ("config_id","receiver_id")
);

-- AddForeignKey
ALTER TABLE "Receivers" ADD CONSTRAINT "Receivers_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "EmailConfig"("config_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivers" ADD CONSTRAINT "Receivers_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
