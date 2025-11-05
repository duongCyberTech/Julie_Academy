/*
  Warnings:

  - You are about to drop the column `father_cate_id` on the `Categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Categories" DROP CONSTRAINT "fk_recursive_cate";

-- AlterTable
ALTER TABLE "public"."Categories" DROP COLUMN "father_cate_id",
ADD COLUMN     "parent_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Categories" ADD CONSTRAINT "fk_recursive_cate" FOREIGN KEY ("parent_id") REFERENCES "public"."Categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
