-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'tutor', 'student', 'parents');

-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."ClassStatus" AS ENUM ('pending', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'short_answer', 'essay');

-- CreateEnum
CREATE TYPE "public"."DifficultyLevel" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "public"."QuestionStatus" AS ENUM ('draft', 'ready');

-- CreateEnum
CREATE TYPE "public"."QuestionAccess" AS ENUM ('private', 'public');

-- CreateEnum
CREATE TYPE "public"."ExamType" AS ENUM ('practice', 'test', 'final');

-- CreateEnum
CREATE TYPE "public"."PlanType" AS ENUM ('book', 'custom');

-- CreateEnum
CREATE TYPE "public"."ResourceStatus" AS ENUM ('show', 'hidden');

-- CreateEnum
CREATE TYPE "public"."EnrollStatus" AS ENUM ('pending', 'accepted', 'cancelled', 'completed');

-- CreateTable
CREATE TABLE "public"."User" (
    "uid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "mname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "public"."UserRole" NOT NULL DEFAULT 'student',
    "status" "public"."AccountStatus" NOT NULL DEFAULT 'inactive',
    "avata_url" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "public"."Tutor" (
    "uid" TEXT NOT NULL,
    "phone_number" TEXT,
    "experiences" TEXT,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "public"."Parents" (
    "uid" TEXT NOT NULL,
    "phone_number" TEXT,

    CONSTRAINT "Parents_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "uid" TEXT NOT NULL,
    "school" TEXT,
    "dob" TIMESTAMP(3),

    CONSTRAINT "Student_pkey" PRIMARY KEY ("uid")
);

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
CREATE TABLE "public"."is_family" (
    "student_uid" TEXT NOT NULL,
    "parents_uid" TEXT NOT NULL,

    CONSTRAINT "is_family_pkey" PRIMARY KEY ("student_uid","parents_uid")
);

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "feed_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutor_uid" TEXT NOT NULL,
    "student_uid" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("feed_id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "rating" DECIMAL(3,1) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("student_id","class_id")
);

-- CreateTable
CREATE TABLE "public"."Badge" (
    "badge_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("badge_id")
);

-- CreateTable
CREATE TABLE "public"."Claim" (
    "student_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("student_id","badge_id")
);

-- CreateTable
CREATE TABLE "public"."Class" (
    "class_id" TEXT NOT NULL,
    "classname" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_time" INTEGER NOT NULL,
    "nb_of_student" INTEGER NOT NULL,
    "status" "public"."ClassStatus" NOT NULL DEFAULT 'pending',
    "grade" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "tutor_uid" TEXT NOT NULL,
    "startat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "plan_id" TEXT,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "schedule_id" INTEGER NOT NULL,
    "class_id" TEXT NOT NULL,
    "startAt" TEXT NOT NULL,
    "endAt" TEXT NOT NULL,
    "link_meet" TEXT NOT NULL,
    "meeting_date" DECIMAL NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("schedule_id","class_id")
);

-- CreateTable
CREATE TABLE "public"."Learning" (
    "class_id" TEXT NOT NULL,
    "student_uid" TEXT NOT NULL,
    "status" "public"."EnrollStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Learning_pkey" PRIMARY KEY ("class_id","student_uid")
);

-- CreateTable
CREATE TABLE "public"."Thread" (
    "thread_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uid" TEXT NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("thread_id")
);

-- CreateTable
CREATE TABLE "public"."Comments" (
    "thread_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uid" TEXT NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("thread_id","comment_id")
);

-- CreateTable
CREATE TABLE "public"."Follow" (
    "thread_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("thread_id","uid")
);

-- CreateTable
CREATE TABLE "public"."Resources" (
    "did" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_type" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "num_pages" INTEGER NOT NULL,
    "tutor_id" TEXT NOT NULL,

    CONSTRAINT "Resources_pkey" PRIMARY KEY ("did")
);

-- CreateTable
CREATE TABLE "public"."Folders" (
    "folder_id" TEXT NOT NULL,
    "folder_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutor_id" TEXT NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "Folders_pkey" PRIMARY KEY ("folder_id")
);

-- CreateTable
CREATE TABLE "public"."Categories" (
    "category_id" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "description" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parent_id" TEXT,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."Resources_in_folder" (
    "resource_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "status" "public"."ResourceStatus" NOT NULL DEFAULT 'show',

    CONSTRAINT "Resources_in_folder_pkey" PRIMARY KEY ("resource_id","folder_id")
);

-- CreateTable
CREATE TABLE "public"."Folder_of_class" (
    "category_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "status" "public"."ResourceStatus" NOT NULL DEFAULT 'show',

    CONSTRAINT "Folder_of_class_pkey" PRIMARY KEY ("category_id","class_id","folder_id")
);

-- CreateTable
CREATE TABLE "public"."Structure" (
    "plan_id" TEXT NOT NULL,
    "cate_id" TEXT NOT NULL,

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("plan_id","cate_id")
);

-- CreateTable
CREATE TABLE "public"."Questions" (
    "ques_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "explaination" TEXT,
    "type" "public"."QuestionType" NOT NULL DEFAULT 'single_choice',
    "level" "public"."DifficultyLevel" NOT NULL DEFAULT 'easy',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_id" TEXT,
    "tutor_id" TEXT NOT NULL,
    "status" "public"."QuestionStatus" NOT NULL DEFAULT 'draft',
    "accessMode" "public"."QuestionAccess" NOT NULL DEFAULT 'private',
    "title" TEXT NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("ques_id")
);

-- CreateTable
CREATE TABLE "public"."Answers" (
    "ques_id" TEXT NOT NULL,
    "aid" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "explaination" TEXT,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("ques_id","aid")
);

-- CreateTable
CREATE TABLE "public"."Exams" (
    "exam_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" "public"."DifficultyLevel" NOT NULL DEFAULT 'easy',
    "duration" INTEGER NOT NULL,
    "total_score" INTEGER NOT NULL,
    "total_ques" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutor_id" TEXT NOT NULL,

    CONSTRAINT "Exams_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "public"."Question_of_exam" (
    "exam_id" TEXT NOT NULL,
    "ques_id" TEXT NOT NULL,
    "score" DECIMAL(4,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "Question_of_exam_pkey" PRIMARY KEY ("exam_id","ques_id")
);

-- CreateTable
CREATE TABLE "public"."Exam_session" (
    "exam_id" TEXT NOT NULL,
    "session_id" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "exam_type" "public"."ExamType" NOT NULL DEFAULT 'practice',
    "limit_taken" INTEGER NOT NULL DEFAULT 1,
    "total_student_done" INTEGER NOT NULL DEFAULT 0,
    "ratio" INTEGER,

    CONSTRAINT "Exam_session_pkey" PRIMARY KEY ("exam_id","session_id")
);

-- CreateTable
CREATE TABLE "public"."Exam_open_in" (
    "session_id" INTEGER NOT NULL,
    "exam_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "Exam_open_in_pkey" PRIMARY KEY ("session_id","exam_id","class_id")
);

-- CreateTable
CREATE TABLE "public"."Exam_taken" (
    "et_id" TEXT NOT NULL,
    "final_score" INTEGER NOT NULL,
    "total_ques_completed" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doneAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exam_id" TEXT,
    "session_id" INTEGER,
    "student_uid" TEXT NOT NULL,

    CONSTRAINT "Exam_taken_pkey" PRIMARY KEY ("et_id")
);

-- CreateTable
CREATE TABLE "public"."Answer_for_exam" (
    "et_id" TEXT NOT NULL,
    "ques_id" TEXT NOT NULL,
    "aid" INTEGER NOT NULL,

    CONSTRAINT "Answer_for_exam_pkey" PRIMARY KEY ("et_id","ques_id","aid")
);

-- CreateTable
CREATE TABLE "public"."Lesson_Plan" (
    "plan_id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(20) NOT NULL,
    "grade" SMALLINT NOT NULL,
    "description" TEXT,
    "type" "public"."PlanType" NOT NULL DEFAULT 'custom',
    "tutor_id" TEXT,

    CONSTRAINT "Lesson_Plan_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "public"."Resource_of_Answer" (
    "did" VARCHAR(255) NOT NULL,
    "aid" SMALLINT NOT NULL,
    "ques_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "Resource_of_Answer_pkey" PRIMARY KEY ("did","aid","ques_id")
);

-- CreateTable
CREATE TABLE "public"."Resource_of_Comment" (
    "thread_id" VARCHAR(255) NOT NULL,
    "comment_id" VARCHAR(255) NOT NULL,
    "did" VARCHAR(255) NOT NULL,

    CONSTRAINT "Resource_of_Comment_pkey" PRIMARY KEY ("did","comment_id","thread_id")
);

-- CreateTable
CREATE TABLE "public"."Resource_of_Question" (
    "did" VARCHAR(255) NOT NULL,
    "ques_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "Resource_of_Question_pkey" PRIMARY KEY ("did","ques_id")
);

-- CreateTable
CREATE TABLE "public"."Resource_of_Thread" (
    "thread_id" VARCHAR(255) NOT NULL,
    "did" VARCHAR(255) NOT NULL,

    CONSTRAINT "Resource_of_Thread_pkey" PRIMARY KEY ("did","thread_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_phone_number_key" ON "public"."Tutor"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Parents_phone_number_key" ON "public"."Parents"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_category_name_key" ON "public"."Categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_Plan_title_key" ON "public"."Lesson_Plan"("title");

-- AddForeignKey
ALTER TABLE "public"."Tutor" ADD CONSTRAINT "Tutor_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Parents" ADD CONSTRAINT "Parents_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."Lesson_Plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."is_family" ADD CONSTRAINT "is_family_parents_uid_fkey" FOREIGN KEY ("parents_uid") REFERENCES "public"."Parents"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."is_family" ADD CONSTRAINT "is_family_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_tutor_uid_fkey" FOREIGN KEY ("tutor_uid") REFERENCES "public"."Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Claim" ADD CONSTRAINT "Claim_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."Badge"("badge_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Claim" ADD CONSTRAINT "Claim_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."Lesson_Plan"("plan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_tutor_uid_fkey" FOREIGN KEY ("tutor_uid") REFERENCES "public"."Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Learning" ADD CONSTRAINT "Learning_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Learning" ADD CONSTRAINT "Learning_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Thread" ADD CONSTRAINT "Thread_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comments" ADD CONSTRAINT "Comments_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."Thread"("thread_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comments" ADD CONSTRAINT "Comments_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."Thread"("thread_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resources" ADD CONSTRAINT "Resources_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "public"."Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folders" ADD CONSTRAINT "Child_folder_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."Folders"("folder_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Folders" ADD CONSTRAINT "Folders_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "public"."Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Categories" ADD CONSTRAINT "fk_recursive_cate" FOREIGN KEY ("parent_id") REFERENCES "public"."Categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Resources_in_folder" ADD CONSTRAINT "Resources_in_folder_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."Resources"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resources_in_folder" ADD CONSTRAINT "Resources_in_folder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."Folders"("folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folder_of_class" ADD CONSTRAINT "Folder_of_class_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folder_of_class" ADD CONSTRAINT "Folder_of_class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Folder_of_class" ADD CONSTRAINT "Folder_of_class_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."Folders"("folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Structure" ADD CONSTRAINT "Structure_cate_id_fkey" FOREIGN KEY ("cate_id") REFERENCES "public"."Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Structure" ADD CONSTRAINT "Structure_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."Lesson_Plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Questions" ADD CONSTRAINT "Questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Questions" ADD CONSTRAINT "Questions_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "public"."Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answers" ADD CONSTRAINT "Answers_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "public"."Questions"("ques_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exams" ADD CONSTRAINT "Exams_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "public"."Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question_of_exam" ADD CONSTRAINT "Question_of_exam_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."Exams"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question_of_exam" ADD CONSTRAINT "Question_of_exam_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "public"."Questions"("ques_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam_session" ADD CONSTRAINT "Exam_session_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."Exams"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam_open_in" ADD CONSTRAINT "Exam_open_in_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam_open_in" ADD CONSTRAINT "Exam_open_in_session_id_exam_id_fkey" FOREIGN KEY ("session_id", "exam_id") REFERENCES "public"."Exam_session"("session_id", "exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam_taken" ADD CONSTRAINT "Exam_taken_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "public"."Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer_for_exam" ADD CONSTRAINT "Answer_for_exam_et_id_fkey" FOREIGN KEY ("et_id") REFERENCES "public"."Exam_taken"("et_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer_for_exam" ADD CONSTRAINT "Answer_for_exam_ques_id_aid_fkey" FOREIGN KEY ("ques_id", "aid") REFERENCES "public"."Answers"("ques_id", "aid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson_Plan" ADD CONSTRAINT "Lesson_Plan_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "public"."Tutor"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_Answer" ADD CONSTRAINT "Resource_of_Answer_did_fkey" FOREIGN KEY ("did") REFERENCES "public"."Resources"("did") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_Answer" ADD CONSTRAINT "Resource_of_Answer_ques_id_aid_fkey" FOREIGN KEY ("ques_id", "aid") REFERENCES "public"."Answers"("ques_id", "aid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_Comment" ADD CONSTRAINT "Resource_of_Comment_did_fkey" FOREIGN KEY ("did") REFERENCES "public"."Resources"("did") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_Comment" ADD CONSTRAINT "Resource_of_Comment_thread_id_comment_id_fkey" FOREIGN KEY ("thread_id", "comment_id") REFERENCES "public"."Comments"("thread_id", "comment_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_Question" ADD CONSTRAINT "Resource_of_Question_did_fkey" FOREIGN KEY ("did") REFERENCES "public"."Resources"("did") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_Question" ADD CONSTRAINT "Resource_of_Question_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "public"."Questions"("ques_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_Thread" ADD CONSTRAINT "Resource_of_Thread_did_fkey" FOREIGN KEY ("did") REFERENCES "public"."Resources"("did") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Resource_of_Thread" ADD CONSTRAINT "Resource_of_Thread_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."Thread"("thread_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
