-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('thread', 'system');

-- CreateTable
CREATE TABLE "Notifications" (
    "notice_id" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "notifyAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "NotificationType" NOT NULL DEFAULT 'system',
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("notice_id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
