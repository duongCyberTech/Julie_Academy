import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RabbitMQService } from "src/rabbitmq/rabbitmq.service";
import { 
    ExamTakenDto, 
    SubmitAnswerDto 
} from "./dto/exam.dto";
import { DifficultyLevel, ExamType, Prisma, PrismaClient, QuestionType } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CurrentQuestionDto } from "./dto/adaptive.dto";

@Injectable()
export class ExamTakenService {
    private readonly MAX_ADAPTIVE_QUESTIONS = 8;

    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
        private rabbitMQService: RabbitMQService
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

            const isTimeValid = await this.prisma.exam_session.findUnique({
                where: {
                    exam_id_session_id: {exam_id, session_id},
                    startAt: {lte: new Date()},
                    expireAt: {gt: new Date()}
                }
            })

            if (!isTimeValid) {
                throw new BadRequestException("Exam is not available now")
            }

            const timeTaken = await this.prisma.exam_taken.count({
                where: {exam_id, session_id, student_uid: student_id}
            })

            const takenLimit = await this.prisma.exam_session.findUnique({
                where: {exam_id_session_id: {exam_id, session_id}},
                select: {
                    limit_taken: true
                }
            })

            if (!takenLimit) {
                throw new NotFoundException("Exam session not found")
            }

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
                return info ? {
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
                } : null
            })

            if (!testInfo) {
                throw new NotFoundException("Exam session not found")
            }

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
                    startAt: new Date(),
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
                        chosen_answer_at: null,
                        isDone: false,
                        answer_set: []
                    }
                })
            })

            const expectedEndTime = new Date(new Date().getTime() + testInfo.duration * 60 * 1000)

            const jobPayload = {
                et_id: takenTime.et_id,
                timeoutAt: testInfo.exam_type === ExamType.practice 
                        ? expectedEndTime
                        : (expectedEndTime < testInfo.expireAt ? expectedEndTime : testInfo.expireAt)
            }

            this.eventEmitter.emit('exam_taken.new', jobPayload)

            return {
                message: "Taking exam",
                info: {et_id: takenTime.et_id, ...testInfo},
                questions: questionList
            }
        })
    }

    async takeAdaptiveExam(category_id: string, student_id: string) {
        const newExamTaken = await this.prisma.exam_taken.create({
            data: {
                startAt: new Date(),
                final_score: 0,
                total_ques_completed: 0,
                student: {connect: {uid: student_id}},
                category: {connect: {category_id: category_id}}
            }
        })

        const question = await this.prisma.questions.findFirst({
            where: {category_id, type: QuestionType.single_choice},
            select: {
                ques_id: true,
                title: true,
                content: true,
                explaination: true,
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
        }).then((ques) => ({
            ...ques,
            index: 1
        }))

        return {
            exam_info: newExamTaken,
            questions: [question]
        }
    }

    async getNextAdaptiveQuestion(student_id: string, category_id: string, cur_ques: CurrentQuestionDto) {
        const ans = await this.prisma.answers.findMany({
            where: {
                question: {ques_id: cur_ques.question_id},
                aid: {in: cur_ques.answers}
            },
            select: {
                aid: true,
                is_correct: true
            }
        })

        const checkCorrect = ans[0]?.is_correct || false;

        await this.prisma.question_for_exam_taken.upsert({
            where: {
                et_id_ques_id: {
                    et_id: cur_ques.et_id,
                    ques_id: cur_ques.question_id
                }
            },
            update: {
                isCorrect: checkCorrect,
                index: cur_ques.index,
                answer_set: cur_ques.answers,
                isDone: true,
                chosen_answer_at: cur_ques.chosen_answer_at,
            },
            create: {
                ques_id: cur_ques.question_id,
                et_id: cur_ques.et_id,
                isCorrect: checkCorrect,
                index: cur_ques.index + 1,
                answer_set: cur_ques.answers,
                isDone: true,
                chosen_answer_at: cur_ques.chosen_answer_at,
            }
        })

        if (cur_ques.index >= this.MAX_ADAPTIVE_QUESTIONS) {
            return this.submitAdaptiveExam(cur_ques.et_id, student_id)
        }

        const question_dons_list = await this.prisma.question_for_exam_taken.findMany({
            where: {
                exam_taken: {
                    student_uid: student_id,
                },
                question: {
                    category_id: category_id,
                    type: QuestionType.single_choice
                },
                isDone: true
            },
            select: {
                ques_id: true,
                isCorrect: true,
                index: true
            },
            orderBy: [
                {exam_taken: {doneAt: 'desc'}},
                {index: 'asc'}
            ],
            take: 10,
            skip: 0
        }).then(list => list.map(item => ({
            ques_id: item.ques_id,
            is_correct: item.isCorrect,
            index: item.index
        })))

        const payload = question_dons_list

        const p_l = await this.rabbitMQService.sendAndWait(payload)

        console.log(`[NestJS - RabbitMQ] Đã nhận P(L) từ AI Python: ${p_l}`);

        if (!p_l) throw new NotFoundException("No more question available")

        const next_level = p_l > 0.8 ? (cur_ques.level == DifficultyLevel.easy ? DifficultyLevel.medium : DifficultyLevel.hard) : 
                            (p_l <= 0.8 && p_l > 0.5 ? cur_ques.level : (cur_ques.level == DifficultyLevel.hard ? DifficultyLevel.medium : DifficultyLevel.easy))

        // Truy vấn câu hỏi tiếp theo dựa trên năng lực đánh giá được
        const question = await this.prisma.questions.findFirst({
            where: {
                exam_takens: {none: {et_id: cur_ques.et_id}},
                category_id,
                type: QuestionType.single_choice,
                level: next_level
            },
            select: {
                ques_id: true,
                title: true,
                content: true,
                explaination: true,
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
        }).then((ques) => ({
            ...ques,
            index: cur_ques.index + 1
        }))

        if (!question?.ques_id) {
            return await this.submitAdaptiveExam(cur_ques.et_id, student_id)
        }

        return question
    }

    async submitAdaptiveExam(et_id: string, student_id: string) {
        const answers: SubmitAnswerDto[] = await this.prisma.question_for_exam_taken.findMany({
            where: {et_id},
            select: {
                ques_id: true,
                answer_set: true,
                index: true,
                chosen_answer_at: true
            }
        }).then((list) => list.map(item => ({
            ques_id: item.ques_id,
            answers: (item.answer_set as number[]) || [],
            index: item.index,
            chosen_answer_at: item.chosen_answer_at
        })))

        return await this.prisma.$transaction(async(tx) => {
            const {score, cnt, ques_correct} = await this.calculateScore(tx, answers)

            const examTaken = await tx.exam_taken.update({
                where: {et_id},
                data: {
                    isDone: true,
                    doneAt: new Date(),
                    total_ques_completed: cnt,
                    final_score: new Prisma.Decimal((score * cnt / this.MAX_ADAPTIVE_QUESTIONS).toFixed(2)),
                }
            })

            await tx.question_for_exam_taken.updateMany({
                where: {et_id},
                data: {
                    isDone: true
                }
            })

            await tx.question_for_exam_taken.updateMany({
                where: {et_id, ques_id: {in: ques_correct}},
                data: {
                    isCorrect: true
                }
            })

            return {
                message: "Adaptive Exam Submitted Successfully",
                data: examTaken
            }
        })
    }

    async getAllPendingExamTaken(student_id: string, class_id: string) {
        return this.prisma.exam_taken.findMany({
            where: {
                student_uid: student_id,
                isDone: false,
                exam_session: {exam_open_in: {some: {class_id}}}
            },
            select: {
                et_id: true,
                exam_id: true,     // I them
                session_id: true,  // I them
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
    }

    async continueTakeExam(et_id: string, student_id: string) {
        return await this.prisma.$transaction(async(tx) => {
            const checkExist = await tx.exam_taken.findFirst({where: {et_id, student: {uid: student_id}}})

            if (!checkExist) throw new NotFoundException("Exam not found");

            const questionsList = await tx.exam_taken.findFirst({
                where: {et_id},
                select: {
                    et_id: true,
                    final_score: true,
                    exam_session: {
                        select: {
                            exam: {
                                select: {
                                    exam_id: true,
                                    title: true,
                                    duration: true, // I them
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

    async getCompletedExamTakens(student_id: string, class_id: string) {
        try {
            return await this.prisma.exam_taken.findMany({
                where: {
                    student_uid: student_id,
                    isDone: true, 
                    exam_session: {
                        exam_open_in: {
                            some: { class_id: class_id } 
                        }
                    }
                },
                select: {
                    et_id: true,
                    exam_id: true,
                    session_id: true,
                    final_score: true,
                    doneAt: true,
                    isDone: true, 
                    startAt: true,              // I thêm
                    total_ques_completed: true  // I thêm
                }
            });
        } catch (error) {
        }
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
        
        let score: number = 0;
        let cnt: number = 0;
        let ques_correct = []

        for (const ans of trueAnswers) {
            let currentQuesScore: number = 0.0;

            if (ans.type === QuestionType.single_choice) {
                const userAnswer = answers.find(i => i.ques_id === ans.ques_id)?.answers[0];
                if (ans.answers[0] === userAnswer) {
                    currentQuesScore = 1.0;
                    cnt++;
                    ques_correct.push(ans.ques_id)
                }
            } else if (ans.type === QuestionType.multiple_choice) {
                const sysAns = ans.answers;
                const subAns = answers.find(i => i.ques_id === ans.ques_id)?.answers || [];
                
                if (subAns.length > 0) {
                    const correctCount = subAns.filter(i => sysAns.includes(i)).length;
                    const wrongCount = subAns.filter(i => !sysAns.includes(i)).length;
                    
                    let subscore: number = (correctCount - wrongCount) * 1.0 / sysAns.length;
                    currentQuesScore = Math.max(subscore, 0.0);

                    if (currentQuesScore > 0.0) {
                        if (currentQuesScore > 0.5) ques_correct.push(ans.ques_id)
                        cnt++;
                    }
                }
            }

            score += currentQuesScore;
        }
        // nếu cần fix sai số
        score = Number(score.toFixed(6));

        return {score, cnt, ques_correct}
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
                        chosen_answer_at: item.chosen_answer_at,
                        isDone: (item.answers.length > 0),
                        answer_set: item.answers
                    }
                }),
                skipDuplicates: true
            })

            const {score, cnt, ques_correct}: {score: number, cnt: number, ques_correct: string[]} = await this.calculateScore(tx, answers)

            const examData = await tx.exam_session.findFirst({
                where: {examTakens: {some: {et_id}}},
                select: {
                    exam_type: true,
                    exam: {
                        select: {
                            total_ques: true,
                            total_score: true
                        }
                    }
                }
            })

            if (!examData) {
                throw new NotFoundException("Exam session not found")
            }

            const examTaken = await tx.exam_taken.update({
                where: {et_id},
                data: {
                    isDone,
                    doneAt: new Date(),
                    total_ques_completed: cnt,
                    final_score: new Prisma.Decimal((score * examData.exam.total_score / examData.exam.total_ques).toFixed(2)),
                }
            })

            await tx.question_for_exam_taken.updateMany({
                where: {et_id, ques_id: {in: ques_correct}},
                data: {
                    isCorrect: true
                }
            })

            if (isDone) {
                const staticsData = {
                    uid: student_id,
                    sum_exam: 1,
                    total_questions: examData.exam.total_ques,
                    total_correct_questions: cnt,
                    final_score: Number((score * examData.exam.total_score / examData.exam.total_ques).toFixed(2)),
                    exam_type: examData.exam_type
                }

                this.eventEmitter.emit('exam_taken.submit', staticsData)
            }

            return {
                message: "Exam Submitted Successfully",
                data: examTaken
            }
        })  
    }

    async getExamTakenById(et_id: string) {
        return await this.prisma.exam_taken.findUnique({
            where: {et_id}
        }).catch(err => {throw new NotFoundException("Exam taken not found!")}) 
    }
}