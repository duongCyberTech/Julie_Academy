import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionService } from '../question/question.service';
import { ExamDto, ExamSessionDto, ExamTakenDto, SubmitAnswerDto } from './dto/exam.dto';
import { connect } from 'http2';

@Injectable()
export class ExamService {
    constructor(
        private prisma: PrismaService,
        private questionService: QuestionService,
    ) {}

    async createExam(dto: ExamDto, tutor_uid: string) {
        return this.prisma.$transaction(async (tx) => {
            const newExam = await tx.exams.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    duration: dto.duration,
                    total_score: dto.total_score,
                    total_ques: dto.questionLst.length,
                    level: dto.level,
                    createdAt: new Date(),
                    updateAt: new Date(),
                    tutor: { connect: { uid: tutor_uid } },
                },
            });
            for (const ques_id of dto.questionLst) {
                await tx.question_of_exam.create({
                    data: {
                        exam: { connect: { exam_id: newExam.exam_id } },
                        question: { connect: { ques_id: ques_id } },
                    },
                });
            }

            return {status: 201, message: 'Exam created successfully', exam: newExam.exam_id};
        })
    }

    async addQuestionToExam(exam_id: string, ques: string[]) {
        return this.prisma.$transaction(async (tx) => {
            const exam = await tx.exams.findUnique({ where: { exam_id } });
            if (!exam) {
                throw new Error('Exam not found');
            }
            for (const ques_id of ques) {
                await tx.question_of_exam.create({
                    data: {
                        exam: { connect: { exam_id: exam.exam_id } },
                        question: { connect: { ques_id: ques_id } },
                    },
                });
            }
        })
    }

    async removeQuestionFromExam(exam_id: string, ques_id: string) {
        return this.prisma.$transaction(async (tx) => {
            const exam = await tx.exams.findUnique({ where: { exam_id } });
            if (!exam) {
                throw new Error('Exam not found');
            }
            await tx.question_of_exam.deleteMany({
                where: {
                    exam: { exam_id: exam.exam_id },
                    question: { ques_id: ques_id },
                },
            });
        });
    }

    async createExamSession(exam_id: string, class_id: string, dto: ExamSessionDto) {
        return this.prisma.$transaction(async (tx) => {
            const sessionIndex = await tx.exam_session.count({ where: { exam_id } }) + 1;
            const newSession = await tx.exam_session.create({
                data: {
                    exam: { connect: { exam_id } },
                    session_id: sessionIndex,
                    startAt: dto.startAt || new Date(),
                    expireAt: dto.expireAt || new Date(new Date().getTime() + 60*60*1000),
                    exam_type: dto.exam_type || 'practice',
                    limit_taken: dto.limit_taken || 1,
                    total_student_done: 0,
                },
            });

            const openTest = await tx.exam_open_in.create({
                data:{
                    class: { connect: { class_id } },
                    exam_session: { connect: { exam_id_session_id: { exam_id, session_id: newSession.session_id } } }
                }
            })

            if (!openTest) throw new BadRequestException("Create session failed!");
            return {status: 201, message: 'Exam session created successfully', session: newSession.session_id};
        })
    }

    async takeExam(student_uid: string, exam_taken?: Partial<ExamTakenDto>) {
        return this.prisma.$transaction(async (tx) => {
            await tx.exam_taken.create({
                data: {
                    student: { connect: { uid: student_uid } },
                    final_score: 0,
                    total_ques_completed: 0,
                    startAt: new Date(),
                    doneAt: new Date(new Date().getTime() + 60*60*1000),
                    exam_session: (exam_taken?.session_id && exam_taken?.exam_id) 
                        ? { connect: { exam_id_session_id: { exam_id: exam_taken.exam_id, session_id: exam_taken.session_id } } } 
                        : undefined
                },
            });
        })
    }
    
    async calculateScore(answer: SubmitAnswerDto[]){
        return await this.prisma.$transaction(async(tx) => {
            var total_score: number = 0.0
            for (const item of answer){
                const cnt: number = 1.0 * await tx.answers.count({
                    where: { ques_id: item.ques_id }
                });

                const cnt_correct: number = 1.0 * await tx.answers.count({
                    where: {
                        AND: [
                            { ques_id: item.ques_id },
                            { is_correct: true }
                        ]
                    }
                })

                total_score = total_score * 1.0 + 1.0 * cnt_correct / cnt
            }

            return total_score
        })
    }

    async submitAnswer(
        et_id: string,  
        answer: SubmitAnswerDto[]
    ){
        return this.prisma.$transaction(async(tx)=>{
            const score = await this.calculateScore(answer)
            const result = await tx.exam_taken.update({
                data: {
                    final_score: score,
                    total_ques_completed: answer.length,
                    doneAt: new Date(new Date().getTime() + 60*60*1000)
                },
                where: {et_id: et_id}
            })
        })
    }

    async getAllExams(page?: number, limit?: number, search?: string, level?: string) {
        const skip:number = (page - 1) * limit;
        const where: any = {};
        if (level) where.level = level;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.exams.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select:{
                exam_id: true,
                title: true,
                description: true,
                duration: true,
                total_score: true,
                total_ques: true,
                level: true,
                tutor: {
                    select:{ user:{
                        select:{
                            uid: true,
                            fname: true,
                            lname: true,
                            username: true,
                        }
                    }
                    }
                },
            },
        });
    }
    
    async getExamByTutor(
        tutor_uid: string, page?: number, limit?: number, 
        search?: string, level?: string
    ) {
        const skip:number = (page - 1) * limit;
        const where: any = { tutor_uid };
        if (level) where.level = level;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.exams.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select:{
                exam_id: true,
                title: true,
                description: true,
                duration: true,
                total_score: true,
                total_ques: true,
                level: true,
                tutor: {
                    select:{ user:{
                        select:{
                            uid: true,
                            fname: true,
                            lname: true,
                            username: true,
                        }
                    }
                    }
                },
            },
        });
    }

    async getExamDetail(exam_id: string) {
        return this.prisma.exams.findUnique({
            where: { exam_id },
            select:{
                exam_id: true,
                title: true,
                description: true,
                duration: true,
                total_score: true,
                total_ques: true,
                level: true,
                createdAt: true,
                updateAt: true,
                tutor: {
                    select:{ user:{
                        select:{
                            uid: true,
                            fname: true,
                            lname: true,
                            username: true,
                        }
                    }
                    }
                },
            },
        });
    }

    async getQuestionsOfExam(exam_id: string) {
        const questionLinks = await this.prisma.question_of_exam.findMany({
            where: { exam_id },
            select: { ques_id: true },
        });
        const questionIds = questionLinks.map(link => link.ques_id);
        const questions = [];
        for (const ques_id of questionIds) {
            const question = await this.questionService.getQuestionById(ques_id);
            if (question) questions.push(question);
        }
        return questions;
    }
}