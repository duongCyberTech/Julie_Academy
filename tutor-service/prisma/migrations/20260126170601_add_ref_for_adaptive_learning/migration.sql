-- AlterTable
ALTER TABLE "Exam_taken" ADD COLUMN     "category_id" TEXT;

-- AddForeignKey
ALTER TABLE "Exam_taken" ADD CONSTRAINT "Exam_taken_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;
