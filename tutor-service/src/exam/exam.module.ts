import { Module } from "@nestjs/common";
import { ExamService } from "./exam.service";
import { ExamTakenService } from "./exam_taken.service";
import { 
    ExamController, 
    ExamSessionController,
    ExamTakenController,
    AdaptiveExamController
} from "./exam.controller";
import { QuestionService } from "src/question/question.service";
import { BackgroundJobModule } from "src/background_job/background-job.module";
import { RabbitMQModule } from "src/rabbitmq/rabbitmq.module";

@Module({
    imports: [BackgroundJobModule, RabbitMQModule],
    controllers: [ExamController, ExamSessionController, ExamTakenController, AdaptiveExamController],
    providers: [ExamService, QuestionService, ExamTakenService]
})
export class ExamModule{}