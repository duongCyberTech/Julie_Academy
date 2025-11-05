-- AlterTable
ALTER TABLE "public"."Categories" ADD COLUMN     "father_cate_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Categories" ADD CONSTRAINT "fk_recursive_cate" FOREIGN KEY ("father_cate_id") REFERENCES "public"."Categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
