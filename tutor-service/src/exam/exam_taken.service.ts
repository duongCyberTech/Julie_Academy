import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { QuestionService } from "src/question/question.service";
import { 
    ExamTakenDto, 
    SubmitAnswerDto 
} from "./dto/exam.dto";
import { DateTime } from 'luxon'
import { ExamType, Prisma, PrismaClient, QuestionType } from "@prisma/client";

@Injectable()
export class ExamTakenService {
    constructor(
        private prisma: PrismaService
    ){}

    async takeExam(class_id: string, exam_id: string, session_id: number, student_id: string) {
        return await this.prisma.$transaction(async(tx) => {
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

            const testInfo = await this.prisma.exam_session.findUnique({
                where: {
                    exam_id_session_id: {exam_id, session_id}
                },
                select: {
                    exam: {
                        select: {
                            title: true,
                            description: true,
                            total_ques:true,
                            level: true,
                            duration: true,
                        }
                    },
                    exam_id: true,
                    session_id: true,
                    startAt: true,
                    expireAt: true,
                    limit_taken: true,
                    exam_type: true
                }
            }).then((info) => {
                return {
                    exam_id: info.exam_id,
                    session_id: info.session_id,
                    title: info.exam.title,
                    description: info.exam.description,
                    level: info.exam.level,
                    duration: info.exam.duration,
                    startAt: info.startAt,
                    expireAt: info.expireAt,
                    limit_taken: info.limit_taken,
                    exam_type: info.exam_type
                }
            })

            const questionList = await this.prisma.questions.findMany({
                where: {
                    exam_questions: {some: {exam: {exam_id}}}
                },
                select: {
                    ques_id: true,
                    title: true,
                    content: true,
                    explaination: true,
                    type: true,
                    level: true,
                    answers: {
                        select: {
                            aid: true,
                            content: true,
                            explaination: true,
                            is_correct: true
                        }
                    }
                }
            }).then((questions) => {
                return questions.map((ques, index) => {
                    return {
                        ...ques,
                        index,
                        answers: ques.answers.map((ans) => {
                            return {
                                ...ans,
                                ...(testInfo.exam_type == ExamType.practice ? {
                                    explaination: ans.explaination,
                                    is_correct: ans.is_correct
                                } : {})
                            }
                        })
                    }
                }).sort((a, b) => a.index - b.index)
            });

            const takenTime = await tx.exam_taken.create({
                data: {
                    startAt: now,
                    doneAt: now,
                    final_score: 0,
                    total_ques_completed: 0,
                    student: {connect: {uid: student_id}},
                    ...(exam_id && session_id ? {exam_session: {connect: {exam_id_session_id: {exam_id, session_id}}}} : {})
                }
            })

            await tx.question_for_exam_taken.createMany({
                data: questionList.map((item) => {
                    return {
                        et_id: takenTime.et_id,
                        ques_id: item.ques_id,
                        index: item.index, 
                        ms_first_response: 0n,
                        ms_total_response: 0n,
                        isDone: false,
                        answer_set: []
                    }
                })
            })

            return {
                message: "Taking exam",
                info: {et_id: takenTime.et_id, ...testInfo},
                questions: questionList
            }
        })
    }

    async continueTakeExam(et_id: string, student_id: string) {
        return await this.prisma.$transaction(async(tx) => {
            const checkExist = await tx.exam_taken.findFirst({where: {et_id, student: {uid: student_id}}})

            if (!checkExist) throw new NotFoundException("Exam not found");

            const questionsList = await tx.exam_taken.findUnique({
                where: {et_id},
                select: {
                    et_id: true,
                    exam_session: {
                        select: {
                            exam: {
                                select: {
                                    exam_id: true,
                                    title: true,
                                    total_ques: true,
                                    total_score: true,
                                    description: true
                                }
                            },
                            exam_type: true,
                            startAt: true,
                            expireAt: true,
                            limit_taken: true
                        }
                    },
                    questions: {
                        select: {
                            question: {
                                select: {
                                    ques_id: true,
                                    title: true,
                                    content: true,
                                    type: true,
                                    level: true,
                                    answers: {
                                        select: {
                                            aid: true,
                                            content: true,
                                        }
                                    }
                                }
                            },
                            answer_set: true
                        }
                    }
                }
            })

            return {
                message: "Continue with the exam",
                data: questionsList
            }
        })
    }

    async calculateScore(tx: Prisma.TransactionClient, answers: SubmitAnswerDto[]) {
        const trueAnswers = await tx.questions.findMany({
            where: {
                ques_id: {in: answers.map(i => i.ques_id)},
                OR: [
                    {type: QuestionType.single_choice},
                    {type: QuestionType.multiple_choice}
                ]
            },
            select: {
                ques_id: true,
                answers: {
                    where: {
                        is_correct: true
                    },
                    select: {
                        aid: true
                    }
                },
                type: true
            }
        }).then((anss) => {
            return anss.map((item) => {
                return {
                    ques_id: item.ques_id,
                    answers: item.answers.map(i => i.aid),
                    type: item.type
                }
            })
        })
        
        var score = 0.0
        var cnt = 0
        for (const ans of trueAnswers) {
            if (ans.type === QuestionType.single_choice) {
                const checkAns = (ans.answers[0] == answers.find(i => i.ques_id).answers[0])
                if (checkAns) {
                    score = score + 1.0
                    cnt++
                }
            } else if (ans.type === QuestionType.multiple_choice) {
                const sysAns = ans.answers
                const subAns = answers.find(i => i.ques_id == ans.ques_id).answers
                const subscore = + 1.0 * Math.max((subAns.filter(i => sysAns.includes(i)).length - subAns.filter(i => !sysAns.includes(i)).length), 0) / sysAns.length
                if (subscore > 0) cnt++
                score += subscore
            }
        }

        return {score, cnt}
    }

    async submitExam(class_id: string, et_id: string, isDone: boolean, student_id: string, answers: SubmitAnswerDto[]) {
        return await this.prisma.$transaction(async (tx) => {
            const isStudentInClass = await tx.learning.findUnique({where: {class_id_student_uid: {class_id, student_uid: student_id}}});
            if (!isStudentInClass) {
                throw new BadRequestException("Student is not in class")
            }

            await tx.question_for_exam_taken.deleteMany({where: {exam_taken: {et_id}}})

            await tx.question_for_exam_taken.createMany({
                data: answers.map((item) => {
                    return {
                        ques_id: item.ques_id,
                        et_id,
                        index: item.index,
                        ms_first_response: item.ms_first_response,
                        ms_total_response: item.ms_total_response,
                        isDone: (item.answers.length > 0),
                        answer_set: item.answers
                    }
                })
            })

            const {score, cnt} = await this.calculateScore(tx, answers)

            const now = DateTime.now().setZone('Asia/Ho_Chi_Minh').toJSDate()
            const examTaken = await tx.exam_taken.update({
                where: {et_id},
                data: {
                    isDone,
                    doneAt: now,
                    total_ques_completed: cnt,
                    final_score: score
                }
            })

            return {
                message: "Exam Submitted Successfully",
                data: examTaken
            }
        })  
    }
}