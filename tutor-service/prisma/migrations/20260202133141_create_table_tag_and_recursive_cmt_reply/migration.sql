/*
  Warnings:

  - The primary key for the `Comments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `parent_cmt_id` column on the `Comments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ms_first_response` on the `Question_for_exam_taken` table. All the data in the column will be lost.
  - You are about to drop the column `ms_total_response` on the `Question_for_exam_taken` table. All the data in the column will be lost.
  - The primary key for the `Resource_of_Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `comment_id` on the `Comments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `comment_id` on the `Resource_of_Comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_parent_cmt_id_fkey";

-- DropForeignKey
ALTER TABLE "Resource_of_Comment" DROP CONSTRAINT "Resource_of_Comment_thread_id_comment_id_fkey";

-- DropIndex
DROP INDEX "Comments_comment_id_key";

-- DropIndex
DROP INDEX "Comments_parent_cmt_id_key";

-- AlterTable
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_pkey",
DROP COLUMN "comment_id",
ADD COLUMN     "comment_id" INTEGER NOT NULL,
DROP COLUMN "parent_cmt_id",
ADD COLUMN     "parent_cmt_id" INTEGER,
ADD CONSTRAINT "Comments_pkey" PRIMARY KEY ("thread_id", "comment_id");

-- AlterTable
ALTER TABLE "Question_for_exam_taken" DROP COLUMN "ms_first_response",
DROP COLUMN "ms_total_response",
ADD COLUMN     "chosen_answer_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Resource_of_Comment" DROP CONSTRAINT "Resource_of_Comment_pkey",
DROP COLUMN "comment_id",
ADD COLUMN     "comment_id" INTEGER NOT NULL,
ADD CONSTRAINT "Resource_of_Comment_pkey" PRIMARY KEY ("did", "comment_id", "thread_id");

-- CreateTable
CREATE TABLE "Tag" (
    "uid" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "comment_id" INTEGER NOT NULL,
    "tagAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("uid","thread_id","comment_id")
);

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_thread_id_parent_cmt_id_fkey" FOREIGN KEY ("thread_id", "parent_cmt_id") REFERENCES "Comments"("thread_id", "comment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Comment" ADD CONSTRAINT "Resource_of_Comment_thread_id_comment_id_fkey" FOREIGN KEY ("thread_id", "comment_id") REFERENCES "Comments"("thread_id", "comment_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
