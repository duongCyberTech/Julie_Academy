/*
  Warnings:

  - A unique constraint covering the columns `[student_id]` on the table `Student_analytics` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Student_analytics_student_id_key" ON "Student_analytics"("student_id");
