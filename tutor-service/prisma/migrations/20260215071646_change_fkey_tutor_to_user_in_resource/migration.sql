/*
  Warnings:

  - You are about to drop the column `tutor_id` on the `Resources` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Resources` table without a default value. This is not possible if the table is not empty.

*/
-- 1. Thêm cột user_id cho phép NULL
ALTER TABLE "Resources" ADD COLUMN IF NOT EXISTS "user_id" TEXT;

-- 2. Chép dữ liệu từ bảng Tutor (nếu cột tutor_id còn tồn tại)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Resources' AND column_name='tutor_id') THEN
        UPDATE "Resources" SET "user_id" = "Tutor"."uid"
        FROM "Tutor" WHERE "Resources"."tutor_id" = "Tutor"."uid";
    END IF;
END $$;

-- Set not null
ALTER TABLE "Resources"
ALTER COLUMN "user_id" SET NOT NULL;


-- 3. Xóa FK cũ và cột cũ an toàn
ALTER TABLE "Resources" DROP CONSTRAINT IF EXISTS "Resources_tutor_id_fkey";
ALTER TABLE "Resources" DROP COLUMN IF EXISTS "tutor_id";

-- 4. Tạo FK mới với SET NULL
ALTER TABLE "Resources" DROP CONSTRAINT IF EXISTS "Resources_user_id_fkey";
ALTER TABLE "Resources" ADD CONSTRAINT "Resources_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;