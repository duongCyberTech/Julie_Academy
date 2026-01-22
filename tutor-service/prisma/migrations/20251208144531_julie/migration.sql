/*
  Warnings:

  - The primary key for the `Resource_of_class` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `resource_id` on the `Resource_of_class` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Resource_of_class" DROP CONSTRAINT "Resource_of_class_resource_id_fkey";

-- AlterTable
ALTER TABLE "public"."Resource_of_class" DROP CONSTRAINT "Resource_of_class_pkey",
DROP COLUMN "resource_id",
ADD CONSTRAINT "Resource_of_class_pkey" PRIMARY KEY ("category_id", "class_id", "folder_id");

-- CreateTable
CREATE TABLE "public"."Resources_in_folder" (
    "resource_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "status" "public"."ResourceStatus" NOT NULL DEFAULT 'show',

    CONSTRAINT "Resources_in_folder_pkey" PRIMARY KEY ("resource_id","folder_id")
);

-- AddForeignKey
ALTER TABLE "public"."Resources_in_folder" ADD CONSTRAINT "Resources_in_folder_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."Resources"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resources_in_folder" ADD CONSTRAINT "Resources_in_folder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."Folders"("folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;
