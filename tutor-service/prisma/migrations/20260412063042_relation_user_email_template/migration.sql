/*
  Warnings:

  - Added the required column `user_id` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
