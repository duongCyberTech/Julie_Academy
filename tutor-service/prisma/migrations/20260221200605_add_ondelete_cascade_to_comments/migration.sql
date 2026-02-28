-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_thread_id_parent_cmt_id_fkey";

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_thread_id_parent_cmt_id_fkey" FOREIGN KEY ("thread_id", "parent_cmt_id") REFERENCES "Comments"("thread_id", "comment_id") ON DELETE CASCADE ON UPDATE CASCADE;
