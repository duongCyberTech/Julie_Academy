-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
