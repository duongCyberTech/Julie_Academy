-- CreateTable
CREATE TABLE "Likes" (
    "react_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "comment_id" INTEGER,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("react_id")
);

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_thread_id_comment_id_fkey" FOREIGN KEY ("thread_id", "comment_id") REFERENCES "Comments"("thread_id", "comment_id") ON DELETE RESTRICT ON UPDATE CASCADE;
