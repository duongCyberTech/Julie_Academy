-- CreateIndex
CREATE INDEX "Class_tutor_uid_idx" ON "Class"("tutor_uid");

-- CreateIndex
CREATE INDEX "Comments_thread_id_idx" ON "Comments"("thread_id");

-- CreateIndex
CREATE INDEX "Comments_uid_idx" ON "Comments"("uid");

-- CreateIndex
CREATE INDEX "EmailConfig_class_id_idx" ON "EmailConfig"("class_id");

-- CreateIndex
CREATE INDEX "Exam_taken_student_uid_idx" ON "Exam_taken"("student_uid");

-- CreateIndex
CREATE INDEX "Exams_tutor_id_idx" ON "Exams"("tutor_id");

-- CreateIndex
CREATE INDEX "Notifications_user_id_idx" ON "Notifications"("user_id");

-- CreateIndex
CREATE INDEX "Questions_tutor_id_idx" ON "Questions"("tutor_id");

-- CreateIndex
CREATE INDEX "Schedule_class_id_idx" ON "Schedule"("class_id");

-- CreateIndex
CREATE INDEX "Student_analytics_student_id_idx" ON "Student_analytics"("student_id");

-- CreateIndex
CREATE INDEX "Thread_class_id_idx" ON "Thread"("class_id");
