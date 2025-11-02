-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'tutor', 'student', 'parents');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('pending', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'short_answer', 'essay');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('practice', 'test', 'final');

-- CreateTable
CREATE TABLE "User" (
    "uid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "mname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "UserRole" NOT NULL DEFAULT 'student',
    "status" "AccountStatus" NOT NULL DEFAULT 'inactive',
    "avata_url" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Tutor" (
    "uid" TEXT NOT NULL,
    "phone_number" TEXT,
    "experiences" TEXT,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Parents" (
    "uid" TEXT NOT NULL,
    "phone_number" TEXT,

    CONSTRAINT "Parents_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Student" (
    "uid" TEXT NOT NULL,
    "school" TEXT,
    "dob" TIMESTAMP(3),

    CONSTRAINT "Student_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "is_family" (
    "student_uid" TEXT NOT NULL,
    "parents_uid" TEXT NOT NULL,

    CONSTRAINT "is_family_pkey" PRIMARY KEY ("student_uid","parents_uid")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "feed_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutor_uid" TEXT NOT NULL,
    "student_uid" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("feed_id")
);

-- CreateTable
CREATE TABLE "Class" (
    "class_id" TEXT NOT NULL,
    "classname" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_time" INTEGER NOT NULL,
    "nb_of_student" INTEGER NOT NULL,
    "status" "ClassStatus" NOT NULL DEFAULT 'pending',
    "grade" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "tutor_uid" TEXT NOT NULL,
    "startat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "schedule_id" INTEGER NOT NULL,
    "class_id" TEXT NOT NULL,
    "startAt" TEXT NOT NULL,
    "endAt" TEXT NOT NULL,
    "link_meet" TEXT NOT NULL,
    "meeting_date" DECIMAL NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("schedule_id","class_id")
);

-- CreateTable
CREATE TABLE "Learning" (
    "class_id" TEXT NOT NULL,
    "student_uid" TEXT NOT NULL,

    CONSTRAINT "Learning_pkey" PRIMARY KEY ("class_id","student_uid")
);

-- CreateTable
CREATE TABLE "Thread" (
    "thread_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uid" TEXT NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("thread_id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "thread_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uid" TEXT NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("thread_id","comment_id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "thread_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("thread_id","uid")
);

-- CreateTable
CREATE TABLE "Resources" (
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
CREATE TABLE "Resources_of_class" (
    "class_id" TEXT NOT NULL,
    "did" TEXT NOT NULL,

    CONSTRAINT "Resources_of_class_pkey" PRIMARY KEY ("class_id","did")
);

-- CreateTable
CREATE TABLE "Folders" (
    "folder_id" TEXT NOT NULL,
    "folder_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutor_id" TEXT NOT NULL,

    CONSTRAINT "Folders_pkey" PRIMARY KEY ("folder_id")
);

-- CreateTable
CREATE TABLE "Resource_in_folder" (
    "folder_id" TEXT NOT NULL,
    "did" TEXT NOT NULL,

    CONSTRAINT "Resource_in_folder_pkey" PRIMARY KEY ("folder_id","did")
);

-- CreateTable
CREATE TABLE "Folder_of_class" (
    "class_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,

    CONSTRAINT "Folder_of_class_pkey" PRIMARY KEY ("class_id","folder_id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "category_id" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "description" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "book_id" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Questions" (
    "ques_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "explaination" TEXT,
    "type" "QuestionType" NOT NULL DEFAULT 'single_choice',
    "level" "DifficultyLevel" NOT NULL DEFAULT 'easy',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "status" "QuestionStatus" DEFAULT 'private',

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("ques_id")
);

-- CreateTable
CREATE TABLE "Answers" (
    "ques_id" TEXT NOT NULL,
    "aid" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "explaination" TEXT,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("ques_id","aid")
);

-- CreateTable
CREATE TABLE "Exams" (
    "exam_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" "DifficultyLevel" NOT NULL DEFAULT 'easy',
    "duration" INTEGER NOT NULL,
    "total_score" INTEGER NOT NULL,
    "total_ques" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutor_id" TEXT NOT NULL,

    CONSTRAINT "Exams_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "Question_of_exam" (
    "exam_id" TEXT NOT NULL,
    "ques_id" TEXT NOT NULL,
    "score" DECIMAL(2,0) NOT NULL DEFAULT 0.00,

    CONSTRAINT "Question_of_exam_pkey" PRIMARY KEY ("exam_id","ques_id")
);

-- CreateTable
CREATE TABLE "Exam_session" (
    "exam_id" TEXT NOT NULL,
    "session_id" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "exam_type" "ExamType" NOT NULL DEFAULT 'practice',
    "limit_taken" INTEGER NOT NULL DEFAULT 1,
    "total_student_done" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Exam_session_pkey" PRIMARY KEY ("exam_id","session_id")
);

-- CreateTable
CREATE TABLE "Exam_open_in" (
    "session_id" INTEGER NOT NULL,
    "exam_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "Exam_open_in_pkey" PRIMARY KEY ("session_id","exam_id","class_id")
);

-- CreateTable
CREATE TABLE "Exam_taken" (
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
CREATE TABLE "Answer_for_exam" (
    "et_id" TEXT NOT NULL,
    "ques_id" TEXT NOT NULL,
    "aid" INTEGER NOT NULL,

    CONSTRAINT "Answer_for_exam_pkey" PRIMARY KEY ("et_id","ques_id","aid")
);

-- CreateTable
CREATE TABLE "Books" (
    "book_id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(20) NOT NULL,
    "grade" SMALLINT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Books_pkey" PRIMARY KEY ("book_id")
);

-- CreateTable
CREATE TABLE "Resource_of_Answer" (
    "did" VARCHAR(255) NOT NULL,
    "aid" SMALLINT NOT NULL,
    "ques_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "Resource_of_Answer_pkey" PRIMARY KEY ("did","aid","ques_id")
);

-- CreateTable
CREATE TABLE "Resource_of_Comment" (
    "thread_id" VARCHAR(255) NOT NULL,
    "comment_id" VARCHAR(255) NOT NULL,
    "did" VARCHAR(255) NOT NULL,

    CONSTRAINT "Resource_of_Comment_pkey" PRIMARY KEY ("did","comment_id","thread_id")
);

-- CreateTable
CREATE TABLE "Resource_of_Question" (
    "did" VARCHAR(255) NOT NULL,
    "ques_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "Resource_of_Question_pkey" PRIMARY KEY ("did","ques_id")
);

-- CreateTable
CREATE TABLE "Resource_of_Thread" (
    "thread_id" VARCHAR(255) NOT NULL,
    "did" VARCHAR(255) NOT NULL,

    CONSTRAINT "Resource_of_Thread_pkey" PRIMARY KEY ("did","thread_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_phone_number_key" ON "Tutor"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Parents_phone_number_key" ON "Parents"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_category_name_key" ON "Categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "Books_title_key" ON "Books"("title");

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parents" ADD CONSTRAINT "Parents_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_family" ADD CONSTRAINT "is_family_parents_uid_fkey" FOREIGN KEY ("parents_uid") REFERENCES "Parents"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "is_family" ADD CONSTRAINT "is_family_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tutor_uid_fkey" FOREIGN KEY ("tutor_uid") REFERENCES "Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_tutor_uid_fkey" FOREIGN KEY ("tutor_uid") REFERENCES "Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learning" ADD CONSTRAINT "Learning_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learning" ADD CONSTRAINT "Learning_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resources" ADD CONSTRAINT "Resources_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resources_of_class" ADD CONSTRAINT "Resources_of_class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resources_of_class" ADD CONSTRAINT "Resources_of_class_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_in_folder" ADD CONSTRAINT "Resource_in_folder_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_in_folder" ADD CONSTRAINT "Resource_in_folder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folders"("folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder_of_class" ADD CONSTRAINT "Folder_of_class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder_of_class" ADD CONSTRAINT "Folder_of_class_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folders"("folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "fk_categories_books" FOREIGN KEY ("book_id") REFERENCES "Books"("book_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "Questions"("ques_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_of_exam" ADD CONSTRAINT "Question_of_exam_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exams"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_of_exam" ADD CONSTRAINT "Question_of_exam_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "Questions"("ques_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_session" ADD CONSTRAINT "Exam_session_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exams"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_open_in" ADD CONSTRAINT "Exam_open_in_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_open_in" ADD CONSTRAINT "Exam_open_in_session_id_exam_id_fkey" FOREIGN KEY ("session_id", "exam_id") REFERENCES "Exam_session"("session_id", "exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_taken" ADD CONSTRAINT "Exam_taken_student_uid_fkey" FOREIGN KEY ("student_uid") REFERENCES "Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer_for_exam" ADD CONSTRAINT "Answer_for_exam_et_id_fkey" FOREIGN KEY ("et_id") REFERENCES "Exam_taken"("et_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer_for_exam" ADD CONSTRAINT "Answer_for_exam_ques_id_aid_fkey" FOREIGN KEY ("ques_id", "aid") REFERENCES "Answers"("ques_id", "aid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource_of_Answer" ADD CONSTRAINT "Resource_of_Answer_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Resource_of_Answer" ADD CONSTRAINT "Resource_of_Answer_ques_id_aid_fkey" FOREIGN KEY ("ques_id", "aid") REFERENCES "Answers"("ques_id", "aid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Resource_of_Comment" ADD CONSTRAINT "Resource_of_Comment_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Resource_of_Comment" ADD CONSTRAINT "Resource_of_Comment_thread_id_comment_id_fkey" FOREIGN KEY ("thread_id", "comment_id") REFERENCES "Comments"("thread_id", "comment_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Resource_of_Question" ADD CONSTRAINT "Resource_of_Question_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Resource_of_Question" ADD CONSTRAINT "Resource_of_Question_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "Questions"("ques_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Resource_of_Thread" ADD CONSTRAINT "Resource_of_Thread_did_fkey" FOREIGN KEY ("did") REFERENCES "Resources"("did") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Resource_of_Thread" ADD CONSTRAINT "Resource_of_Thread_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
