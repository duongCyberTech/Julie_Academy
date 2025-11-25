-- DropForeignKey
ALTER TABLE "public"."Resources" DROP CONSTRAINT "Resources_cate_id_fkey";

-- AlterTable
ALTER TABLE "public"."Folders" ADD COLUMN     "cate_id" TEXT;

-- AlterTable
ALTER TABLE "public"."Resources" ALTER COLUMN "cate_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Resources" ADD CONSTRAINT "Resources_cate_id_fkey" FOREIGN KEY ("cate_id") REFERENCES "public"."Categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folders" ADD CONSTRAINT "Folders_cate_id_fkey" FOREIGN KEY ("cate_id") REFERENCES "public"."Categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;
