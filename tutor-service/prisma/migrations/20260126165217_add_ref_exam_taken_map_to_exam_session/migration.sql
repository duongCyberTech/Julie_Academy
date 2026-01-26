-- AddForeignKey
ALTER TABLE "Exam_taken" ADD CONSTRAINT "Exam_taken_exam_id_session_id_fkey" FOREIGN KEY ("exam_id", "session_id") REFERENCES "Exam_session"("exam_id", "session_id") ON DELETE SET NULL ON UPDATE CASCADE;
