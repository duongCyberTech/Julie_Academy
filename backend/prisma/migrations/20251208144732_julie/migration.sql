/*
  Warnings:

  - You are about to drop the `Resource_of_class` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Resource_of_class" DROP CONSTRAINT "Resource_of_class_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resource_of_class" DROP CONSTRAINT "Resource_of_class_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resource_of_class" DROP CONSTRAINT "Resource_of_class_folder_id_fkey";

-- DropTable
DROP TABLE "public"."Resource_of_class";

-- CreateTable
CREATE TABLE "public"."Folder_of_class" (
    "category_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "status" "public"."ResourceStatus" NOT NULL DEFAULT 'show',

    CONSTRAINT "Folder_of_class_pkey" PRIMARY KEY ("category_id","class_id","folder_id")
);

-- AddForeignKey
ALTER TABLE "public"."Folder_of_class" ADD CONSTRAINT "Folder_of_class_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folder_of_class" ADD CONSTRAINT "Folder_of_class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folder_of_class" ADD CONSTRAINT "Folder_of_class_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."Folders"("folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;
