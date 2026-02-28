import { Module } from "@nestjs/common";
import { ExamService } from "./exam.service";
import { ExamTakenService } from "./exam_taken.service";
import { 
    ExamController, 
    ExamSessionController,
    ExamTakenController 
} from "./exam.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { QuestionService } from "src/question/question.service";
import { BackgroundJobModule } from "src/background_job/background-job.module";

@Module({
    imports: [BackgroundJobModule],
    controllers: [ExamController, ExamSessionController, ExamTakenController],
    providers: [ExamService, QuestionService, ExamTakenService]
})
export class ExamModule{}