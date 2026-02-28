-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_thread_id_fkey";

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE CASCADE ON UPDATE CASCADE;
