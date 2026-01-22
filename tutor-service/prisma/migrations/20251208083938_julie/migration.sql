/*
  Warnings:

  - You are about to drop the column `cate_id` on the `Folders` table. All the data in the column will be lost.
  - You are about to drop the column `cate_id` on the `Resources` table. All the data in the column will be lost.
  - You are about to drop the `Folder_of_class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resource_in_folder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resources_of_class` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ResourceStatus" AS ENUM ('show', 'hidden');

-- DropForeignKey
ALTER TABLE "public"."Folder_of_class" DROP CONSTRAINT "Folder_of_class_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Folder_of_class" DROP CONSTRAINT "Folder_of_class_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Folders" DROP CONSTRAINT "Folders_cate_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resource_in_folder" DROP CONSTRAINT "Resource_in_folder_did_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resource_in_folder" DROP CONSTRAINT "Resource_in_folder_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resources" DROP CONSTRAINT "Resources_cate_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resources_of_class" DROP CONSTRAINT "Resources_of_class_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resources_of_class" DROP CONSTRAINT "Resources_of_class_did_fkey";

-- AlterTable
ALTER TABLE "public"."Folders" DROP COLUMN "cate_id";

-- AlterTable
ALTER TABLE "public"."Resources" DROP COLUMN "cate_id";

-- DropTable
DROP TABLE "public"."Folder_of_class";

-- DropTable
DROP TABLE "public"."Resource_in_folder";

-- DropTable
DROP TABLE "public"."Resources_of_class";

-- CreateTable
CREATE TABLE "public"."Model" (
    "model_id" TEXT NOT NULL,
    "init" DECIMAL(4,2) NOT NULL,
    "transit" DECIMAL(4,2) NOT NULL,
    "guess" DECIMAL(4,2) NOT NULL,
    "slip" DECIMAL(4,2) NOT NULL,
    "student_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("model_id")
);

-- CreateTable
CREATE TABLE "public"."Resource_of_class" (
    "resource_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "status" "public"."ResourceStatus" NOT NULL DEFAULT 'show',

    CONSTRAINT "Resource_of_class_pkey" PRIMARY KEY ("resource_id","category_id","class_id","folder_id")
);

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."Lesson_Plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_class" ADD CONSTRAINT "Resource_of_class_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."Resources"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_class" ADD CONSTRAINT "Resource_of_class_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_class" ADD CONSTRAINT "Resource_of_class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_class" ADD CONSTRAINT "Resource_of_class_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."Folders"("folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;
