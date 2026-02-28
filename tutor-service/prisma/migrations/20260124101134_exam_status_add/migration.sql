-- AlterTable
ALTER TABLE "Exam_taken" ADD COLUMN     "isDone" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Question_for_exam_taken" (
    "ques_id" TEXT NOT NULL,
    "et_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Question_for_exam_taken_pkey" PRIMARY KEY ("et_id","ques_id")
);

-- AddForeignKey
ALTER TABLE "Question_for_exam_taken" ADD CONSTRAINT "Question_for_exam_taken_et_id_fkey" FOREIGN KEY ("et_id") REFERENCES "Exam_taken"("et_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_for_exam_taken" ADD CONSTRAINT "Question_for_exam_taken_ques_id_fkey" FOREIGN KEY ("ques_id") REFERENCES "Questions"("ques_id") ON DELETE RESTRICT ON UPDATE CASCADE;
