-- DropForeignKey
ALTER TABLE "Answers" DROP CONSTRAINT "Answers_ques_id_fkey";

-- DropForeignKey
ALTER TABLE "Categories" DROP CONSTRAINT "fk_recursive_cate";

-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_badge_id_fkey";

-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_tutor_uid_fkey";

-- DropForeignKey
ALTER TABLE "Exam_open_in" DROP CONSTRAINT "Exam_open_in_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Exam_open_in" DROP CONSTRAINT "Exam_open_in_session_id_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "Exam_session" DROP CONSTRAINT "Exam_session_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "Exam_taken" DROP CONSTRAINT "Exam_taken_student_uid_fkey";

-- DropForeignKey
ALTER TABLE "Exams" DROP CONSTRAINT "Exams_tutor_id_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_student_uid_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_tutor_uid_fkey";

-- DropForeignKey
ALTER TABLE "Folder_of_class" DROP CONSTRAINT "Folder_of_class_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Folder_of_class" DROP CONSTRAINT "Folder_of_class_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Folder_of_class" DROP CONSTRAINT "Folder_of_class_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "Folders" DROP CONSTRAINT "Child_folder_fkey";

-- DropForeignKey
ALTER TABLE "Folders" DROP CONSTRAINT "Folders_tutor_id_fkey";

-- DropForeignKey
ALTER TABLE "Learning" DROP CONSTRAINT "Learning_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Learning" DROP CONSTRAINT "Learning_student_uid_fkey";

-- DropForeignKey
ALTER TABLE "Parents" DROP CONSTRAINT "Parents_uid_fkey";

-- DropForeignKey
ALTER TABLE "Question_for_exam_taken" DROP CONSTRAINT "Question_for_exam_taken_et_id_fkey";

-- DropForeignKey
ALTER TABLE "Question_for_exam_taken" DROP CONSTRAINT "Question_for_exam_taken_ques_id_fkey";

-- DropForeignKey
ALTER TABLE "Question_of_exam" DROP CONSTRAINT "Question_of_exam_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "Question_of_exam" DROP CONSTRAINT "Question_of_exam_ques_id_fkey";

-- DropForeignKey
ALTER TABLE "Questions" DROP CONSTRAINT "Questions_tutor_id_fkey";

-- DropForeignKey
ALTER TABLE "Resource_of_Answer" DROP CONSTRAINT "Resource_of_Answer_did_fkey";

-- DropForeignKey
ALTER TABLE "Resource_of_Answer" DROP CONSTRAINT "Resource_of_Answer_ques_id_aid_fkey";

-- DropForeignKey
ALTER TABLE "Resource_of_Comment" DROP CONSTRAINT "Resource_of_Comment_did_fkey";

-- DropForeignKey
ALTER TABLE "Resource_of_Comment" DROP CONSTRAINT "Resource_of_Comment_thread_id_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "Resource_of_Question" DROP CONSTRAINT "Resource_of_Question_did_fkey";

-- DropForeignKey
ALTER TABLE "Resource_of_Question" DROP CONSTRAINT "Resource_of_Question_ques_id_fkey";

-- DropForeignKey
ALTER TABLE "Resource_of_Thread" DROP CONSTRAINT "Resource_of_Thread_did_fkey";

-- DropForeignKey
ALTER TABLE "Resource_of_Thread" DROP CONSTRAINT "Resource_of_Thread_thread_id_fkey";

-- DropForeignKey
ALTER TABLE "Resources" DROP CONSTRAINT "Resources_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Resources_in_folder" DROP CONSTRAINT "Resources_in_folder_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "Resources_in_folder" DROP CONSTRAINT "Resources_in_folder_resource_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Structure" DROP CONSTRAINT "Structure_cate_id_fkey";

-- DropForeignKey
ALTER TABLE "Structure" DROP CONSTRAINT "Structure_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_uid_fkey";

-- DropForeignKey
ALTER TABLE "Student_analytics" DROP CONSTRAINT "Student_analytics_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Thread" DROP CONSTRAINT "Thread_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Thread" DROP CONSTRAINT "Thread_uid_fkey";

-- DropForeignKey
ALTER TABLE "Tutor" DROP CONSTRAINT "Tutor_uid_fkey";

-- DropForeignKey
ALTER TABLE "is_family" DROP CONSTRAINT "is_family_parents_uid_fkey";

-- DropForeignKey
ALTER TABLE "is_family" DROP CONSTRAINT "is_family_student_uid_fkey";

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parents" ADD CONSTRAINT "Parents_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_family" ADD CONSTRAINT "is_family_parents_uid_fkey" FOREIGN KEY ("parents_uid") REFERENCES "Parents"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_family" ADD CONSTRAINT "is_family_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "Student"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "Student"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tutor_uid_fkey" FOREIGN KEY ("tutor_uid") REFERENCES "Tutor"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_analytics" ADD CONSTRAINT "Student_analytics_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "Badge"("badge_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_tutor_uid_fkey" FOREIGN KEY ("tutor_uid") REFERENCES "Tutor"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learning" ADD CONSTRAINT "Learning_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learning" ADD CONSTRAINT "Learning_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "Student"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_thread_id_comment_id_fkey" FOREIGN KEY ("thread_id", "comment_id") REFERENCES "Comments"("thread_id", "comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resources" ADD CONSTRAINT "Resources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Child_folder_fkey" FOREIGN KEY ("parent_id") REFERENCES "Folders"("folder_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "fk_recursive_cate" FOREIGN KEY ("parent_id") REFERENCES "Categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resources_in_folder" ADD CONSTRAINT "Resources_in_folder_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "Resources"("did") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resources_in_folder" ADD CONSTRAINT "Resources_in_folder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folders"("folder_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder_of_class" ADD CONSTRAINT "Folder_of_class_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder_of_class" ADD CONSTRAINT "Folder_of_class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder_of_class" ADD CONSTRAINT "Folder_of_class_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folders"("folder_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_cate_id_fkey" FOREIGN KEY ("cate_id") REFERENCES "Categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Lesson_Plan"("plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "Questions"("ques_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_of_exam" ADD CONSTRAINT "Question_of_exam_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exams"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_of_exam" ADD CONSTRAINT "Question_of_exam_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "Questions"("ques_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_session" ADD CONSTRAINT "Exam_session_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exams"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_open_in" ADD CONSTRAINT "Exam_open_in_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_open_in" ADD CONSTRAINT "Exam_open_in_session_id_exam_id_fkey" FOREIGN KEY ("session_id", "exam_id") REFERENCES "Exam_session"("session_id", "exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_taken" ADD CONSTRAINT "Exam_taken_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "Student"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_for_exam_taken" ADD CONSTRAINT "Question_for_exam_taken_et_id_fkey" FOREIGN KEY ("et_id") REFERENCES "Exam_taken"("et_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_for_exam_taken" ADD CONSTRAINT "Question_for_exam_taken_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "Questions"("ques_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Answer" ADD CONSTRAINT "Resource_of_Answer_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Answer" ADD CONSTRAINT "Resource_of_Answer_ques_id_aid_fkey" FOREIGN KEY ("ques_id", "aid") REFERENCES "Answers"("ques_id", "aid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Comment" ADD CONSTRAINT "Resource_of_Comment_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Comment" ADD CONSTRAINT "Resource_of_Comment_thread_id_comment_id_fkey" FOREIGN KEY ("thread_id", "comment_id") REFERENCES "Comments"("thread_id", "comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Question" ADD CONSTRAINT "Resource_of_Question_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Question" ADD CONSTRAINT "Resource_of_Question_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "Questions"("ques_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Thread" ADD CONSTRAINT "Resource_of_Thread_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Thread" ADD CONSTRAINT "Resource_of_Thread_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE CASCADE ON UPDATE CASCADE;
