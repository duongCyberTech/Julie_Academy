import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { QuestionService } from "src/question/question.service";
import { 
    ExamTakenDto, 
    SubmitAnswerDto 
} from "./dto/exam.dto";
import { DateTime } from 'luxon'

@Injectable()
export class ExamTakenService {
    constructor(
        private prisma: PrismaService
    ){}

    async takeExam(class_id: string, exam_id: string, session_id: number, student_id: string) {
        const isStudentInClass = await this.prisma.learning.findUnique({where: {class_id_student_uid: {class_id, student_uid: student_id}}});
        if (!isStudentInClass) {
            throw new BadRequestException("Student is not in class")
        }

        const isExamOpen = this.prisma.exam_open_in.findUnique({where: {session_id_exam_id_class_id: {session_id, exam_id, class_id}}})
        if (!isExamOpen) {
            throw new BadRequestException("Exam is not open in this class")
        }

        const now = DateTime.now().setZone('Asia/Ho_Chi_Minh').toJSDate()
        const isTimeValid = await this.prisma.exam_session.findUnique({
            where: {
                exam_id_session_id: {exam_id, session_id},
                startAt: {lte: now},
                expireAt: {gt: now}
            }
        })

        if (!isTimeValid) {
            throw new BadRequestException("Exam is not available now")
        }

        const timeTaken = await this.prisma.exam_taken.count({
            where: {exam_id, session_id}
        })

        const takenLimit = await this.prisma.exam_session.findUnique({
            where: {exam_id_session_id: {exam_id, session_id}},
            select: {
                limit_taken: true
            }
        })

        if (timeTaken >= takenLimit.limit_taken) {
            throw new BadRequestException("No more time available")
        }
    }
}