import { Module } from "@nestjs/common";
import { ExamService } from "./exam.service";
import { ExamController } from "./exam.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { QuestionService } from "src/question/question.service";

@Module({
    imports: [PrismaModule],
    controllers: [ExamController],
    providers: [ExamService, QuestionService]
})
export class ExamModule{}