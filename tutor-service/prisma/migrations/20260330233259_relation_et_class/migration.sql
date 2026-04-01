-- AlterTable
ALTER TABLE "Exam_taken" ADD COLUMN     "class_id" TEXT;

-- AddForeignKey
ALTER TABLE "Exam_taken" ADD CONSTRAINT "Exam_taken_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE SET NULL ON UPDATE CASCADE;
