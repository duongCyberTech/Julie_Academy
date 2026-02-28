/*
  Warnings:

  - A unique constraint covering the columns `[comment_id]` on the table `Comments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parent_cmt_id]` on the table `Comments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session_id,exam_id]` on the table `Exam_session` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "parent_cmt_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Comments_comment_id_key" ON "Comments"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Comments_parent_cmt_id_key" ON "Comments"("parent_cmt_id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_session_session_id_exam_id_key" ON "Exam_session"("session_id", "exam_id");

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_parent_cmt_id_fkey" FOREIGN KEY ("parent_cmt_id") REFERENCES "Comments"("comment_id") ON DELETE SET NULL ON UPDATE CASCADE;
