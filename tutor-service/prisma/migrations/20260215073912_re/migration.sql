-- DropForeignKey
ALTER TABLE "Resources" DROP CONSTRAINT "Resources_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Resources" ADD CONSTRAINT "Resources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
