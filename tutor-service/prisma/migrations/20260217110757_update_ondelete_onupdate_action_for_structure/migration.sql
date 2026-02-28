-- DropForeignKey
ALTER TABLE "Categories" DROP CONSTRAINT "fk_recursive_cate";

-- DropForeignKey
ALTER TABLE "Lesson_Plan" DROP CONSTRAINT "Lesson_Plan_tutor_id_fkey";

-- DropForeignKey
ALTER TABLE "Structure" DROP CONSTRAINT "Structure_cate_id_fkey";

-- DropForeignKey
ALTER TABLE "Structure" DROP CONSTRAINT "Structure_plan_id_fkey";

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "fk_recursive_cate" FOREIGN KEY ("parent_id") REFERENCES "Categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_cate_id_fkey" FOREIGN KEY ("cate_id") REFERENCES "Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Lesson_Plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson_Plan" ADD CONSTRAINT "Lesson_Plan_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
