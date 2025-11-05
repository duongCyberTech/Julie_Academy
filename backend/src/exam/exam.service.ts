import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionService } from '../question/question.service';
import { ExamDto, ExamSessionDto, ExamTakenDto, SubmitAnswerDto } from './dto/exam.dto';

@Injectable()
export class ExamService {
    constructor(
        private prisma: PrismaService,
        private questionService: QuestionService,
    ) {}

    async createExam(dto: Partial<ExamDto>, tutor_uid: string) {
        return this.prisma.$transaction(async (tx) => {
            const newExam = await tx.exams.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    duration: dto.duration,
                    total_score: dto.total_score,
                    total_ques: dto?.questionLst?.length | 0,
                    level: dto.level,
                    createdAt: new Date(),
                    updateAt: new Date(),
                    tutor: { connect: { uid: tutor_uid } },
                },
            });
            for (const ques_id of (dto.questionLst ? dto.questionLst : [] as string[])) {
                await tx.question_of_exam.create({
                    data: {
                        score: newExam.total_score / newExam.total_ques,
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
            await tx.exams.update({
                where: {exam_id},
                data: {total_ques: {increment: ques.length}}
            })

            const num_ques = await tx.question_of_exam.count({
                where: {exam_id}
            })

            const total_score = await tx.exams.findUnique({
                where:{exam_id}
            }).then((exam) => {return exam.total_score})

            await tx.question_of_exam.updateMany({
                where: {exam_id},
                data: {score: total_score/num_ques}
            })

            return {status: 200, message: "Add question successfully!"}
        })
    }

    async removeQuestionFromExam(exam_id: string, ques_id: string) {
        return this.prisma.$transaction(async (tx) => {
            const exam = await tx.exams.findUnique({ where: { exam_id } });
            if (!exam) {
                throw new Error('Exam not found');
            }
            const deleted = await tx.question_of_exam.deleteMany({
                where: {
                    exam: { exam_id: exam.exam_id },
                    question: { ques_id: ques_id },
                },
            });
            await tx.exams.update({
                where: {exam_id},
                data: {total_ques: {decrement: deleted.count}}
            })
            const num_ques = await tx.question_of_exam.count({
                where: {exam_id}
            })
            if (num_ques == 0) return {status: 200, message: "Delete Successfully!"}

            const total_score = await tx.exams.findUnique({
                where:{exam_id}
            }).then((exam) => {return exam.total_score})

            await tx.question_of_exam.updateMany({
                where: {exam_id},
                data: {score: total_score/num_ques}
            })
        });
    }

    async createExamSession(exam_id: string, classes: string[], dto: ExamSessionDto) {
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
            var cnt_ = 0
            for (const class_id of classes){
                const openTest = await tx.exam_open_in.create({
                    data:{
                        class: { connect: { class_id } },
                        exam_session: { connect: { exam_id_session_id: { exam_id, session_id: newSession.session_id } } }
                    }
                })
                cnt_ = openTest ? (cnt_ + 1) : cnt_;
            }


            if (cnt_ != classes.length) throw new BadRequestException("Create session failed!");
            return {status: 201, message: 'Exam session created successfully', session: newSession.session_id};
        })
    }

    async updateSession(exam_id: string, session_id: number, data: Partial<ExamSessionDto>){
        return this.prisma.$transaction(async(tx) => {
            await tx.exam_session.update({
                where: {exam_id_session_id: {exam_id, session_id}},
                data: {
                    ...data
                }
            })
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
                    session_id: exam_taken.session_id,
                    exam_id: exam_taken.exam_id
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
        const skip:number = page && limit ? (page - 1) * limit : 0;
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
        const skip:number = page && limit ?  (page - 1) * limit : 0;
        const where: any = { tutor_id: tutor_uid };
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

    async updateExam(exam_id: string, data: Partial<ExamDto>){
        return this.prisma.$transaction(async(tx) => {
            return await tx.exams.update({
                where: {exam_id},
                data: {
                    ...data
                }
            })
        })
    }
}