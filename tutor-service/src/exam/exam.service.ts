import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionService } from '../question/question.service';
import { ExamDto, ExamSessionDto, ExamSessionStatus, ExamTakenDto, SubmitAnswerDto } from './dto/exam.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExamService {
    constructor(
        private prisma: PrismaService,
        private questionService: QuestionService,
        private eventEmitter: EventEmitter2
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
        return await this.prisma.$transaction(async (tx) => {
            const sessionIndex = await tx.exam_session.count({ where: { exam_id } }) + 1;
            const duration = await tx.exams.findUnique({where: {exam_id}, select: {duration: true}}).then(res => res.duration);
            if (
                dto.expireAt && dto.startAt && 
                (
                    dto.expireAt < dto.startAt 
                    && 
                    (new Date(dto.expireAt).getTime() - new Date(dto.startAt).getTime() < duration*60*1000 || dto.exam_type === 'practice')
                )
            ) throw new BadRequestException(dto.exam_type === 'practice' ? "Expire time must be at least equal to start time" : "Expire time must be at least equal to start time plus exam duration!");
            
            const newSession = await tx.exam_session.create({
                data: {
                    exam: { connect: { exam_id } },
                    session_id: sessionIndex,
                    startAt: dto.startAt || new Date(),
                    expireAt: dto.expireAt || new Date(new Date().getTime() + duration*60*1000),
                    exam_type: dto.exam_type || 'practice',
                    limit_taken: dto.limit_taken || 1,
                    total_student_done: 0,
                }
            });

            const openList = []
            for (const class_id of classes){
                const openTest = await tx.exam_open_in.create({
                    data:{
                        class: { connect: { class_id } },
                        exam_session: { connect: { exam_id_session_id: { exam_id, session_id: newSession.session_id } } }
                    }
                })
                if (openTest) openList.push(class_id)
            }

            if (openList.length != classes.length) throw new BadRequestException("Create session failed!");

            this.eventEmitter.emit('exam.new', {newSession, openList});

            return {status: 201, message: 'Exam session created successfully', session: newSession.session_id};
        })
    }

    async getAllExamSessionByTutor(tutor_id: string) {
        try {
            const examSessions = await this.prisma.exam_session.findMany({
                where: {
                    exam: {tutor: {uid: tutor_id}},
                    expireAt: {lt: new Date()}
                },
                select: {
                    session_id: true,
                    limit_taken: true,
                    startAt: true,
                    expireAt: true,
                    exam_type: true,
                    total_student_done: true,
                    exam: {
                        select: {
                            exam_id: true,
                            title: true,
                            duration: true,
                            total_ques: true,
                            total_score: true,
                            level: true,
                            description: true
                        }
                    }
                },
                orderBy: [
                    { startAt: "asc" },
                    { expireAt: "asc" }
                ]
            })

            return examSessions
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async getAllExamSessionByClass(user: any, class_id: string, page: number = 1, limit: number = 10, status: ExamSessionStatus = ExamSessionStatus.OPEN) {
        try {
            if (user.role != "student") {
                const currentDate = new Date();
                const timeCondition = status === ExamSessionStatus.UPCOMING
                    ? { startAt: { gt: currentDate } }
                    : (status === ExamSessionStatus.OPEN
                        ? { startAt: { lte: currentDate }, expireAt: { gt: currentDate } }
                        : (status === ExamSessionStatus.EXPIRED
                            ? { expireAt: { lte: currentDate } }
                            : {}));

                const etStatusCondition = status === ExamSessionStatus.PENDING
                    ? { examTakens: { some: { isDone: false } } }
                    : status === ExamSessionStatus.COMPLETED
                        ? { examTakens: { some: { isDone: true } } }
                        : {};

                const examSessions = await this.prisma.exam_session.findMany({
                    take: limit,
                    skip: (page - 1) * limit,
                    where: {
                        exam_open_in: {some: {class: {class_id}}},
                        ...timeCondition,
                        ...etStatusCondition
                    },
                    select: {
                        session_id: true,
                        limit_taken: true,
                        startAt: true,
                        expireAt: true,
                        exam_type: true,
                        total_student_done: true,
                        exam: {
                            select: {
                                exam_id: true,
                                title: true,
                                duration: true,
                                total_ques: true,
                                total_score: true,
                                level: true,
                                description: true
                            }
                        },
                        examTakens: true
                    },
                    orderBy: [
                        { startAt: "desc" },
                        { expireAt: "asc" }
                    ]
                })

                console.log(examSessions.length)

                return examSessions
            } else {
                const currentDate = new Date();
                const offset = (page - 1) * limit;

                // 1. Time Conditions - Added double quotes to column names for safety
                const timeCondition = status === ExamSessionStatus.UPCOMING
                    ? Prisma.sql` AND es."startAt" > ${currentDate}`
                    : status === ExamSessionStatus.OPEN
                        ? Prisma.sql` AND es."startAt" <= ${currentDate} AND es."expireAt" > ${currentDate}`
                        : status === ExamSessionStatus.EXPIRED
                            ? Prisma.sql` AND es."expireAt" <= ${currentDate}`
                            : Prisma.empty;

                // 2. Exam Taken Status Conditions
                const etStatusCondition = status === ExamSessionStatus.PENDING
                    ? Prisma.sql` AND EXISTS (SELECT 1 FROM "Exam_taken" et WHERE et."session_id" = es."session_id" AND et."exam_id" = es."exam_id" AND et."student_uid" = ${user.userId} AND et."isDone" = false)`
                    : status === ExamSessionStatus.COMPLETED
                        ? Prisma.sql` AND EXISTS (SELECT 1 FROM "Exam_taken" et WHERE et."session_id" = es."session_id" AND et."exam_id" = es."exam_id" AND et."student_uid" = ${user.userId} AND et."isDone" = true)`
                        : Prisma.empty;

                const countCondition = status === ExamSessionStatus.COMPLETED ? 
                                        Prisma.empty : 
                                        Prisma.sql` AND (
                                            SELECT COUNT(*) FROM "Exam_taken" et 
                                            WHERE et."session_id" = es."session_id" 
                                            AND et."exam_id" = es."exam_id" 
                                            AND et."student_uid" = ${user.userId}
                                        ) < es."limit_taken"`

                // 3. The Final Query
                const examSessions = await this.prisma.$queryRaw`
                    SELECT 
                        es.session_id, es.exam_id, es.limit_taken, es."startAt", es."expireAt", es.exam_type,
                        json_build_object(
                            'exam_id', e.exam_id,
                            'title', e.title,
                            'duration', e.duration,
                            'total_ques', e.total_ques
                        ) AS exam,
                        (
                            SELECT COUNT(*) FROM "Exam_taken" et 
                            WHERE et."session_id" = es."session_id" 
                            AND et."exam_id" = es."exam_id" 
                            AND et."student_uid" = ${user.userId}
                        ) AS attempt_count,
                        (
                            SELECT json_agg(json_build_object(
                                'et_id', et.et_id, 
                                'isDone', et."isDone", 
                                'final_score', et.final_score, 
                                'doneAt', et."doneAt"
                            ))
                            FROM "Exam_taken" et
                            WHERE et.session_id = es.session_id AND et.exam_id = es.exam_id AND et.student_uid = ${user.userId}
                        ) AS exam_takens,
                    FROM "Exam_session" es
                    JOIN "Exams" e ON es."exam_id" = e."exam_id"
                    JOIN "Exam_open_in" eoi ON es."session_id" = eoi."session_id" AND es."exam_id" = eoi."exam_id"
                    WHERE 
                        eoi."class_id" = ${class_id}
                    -- Logic: check if specific student's attempt count < limit_taken
                    ${countCondition} 
                    ${timeCondition} 
                    ${etStatusCondition} 
                    ORDER BY es."startAt" ASC, es."expireAt" ASC
                    LIMIT ${limit} OFFSET ${offset}
                `;

                return examSessions;
            }
        } catch (error) {
        }
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

    // Lấy tất cả bài tập từ tất cả các lớp mà học sinh đang học
    async getAllExamSessionsForStudent(student_id: string, page: number = 1, limit: number = 10, status: ExamSessionStatus = ExamSessionStatus.OPEN) {
        try {
            const currentDate = new Date();
            const offset = (page - 1) * limit;

            console.log("[STUDENT GET]: ", student_id, " | Status: ", status, " | Time: ", currentDate)

            // 1. Time Conditions (Ensure columns with capital letters are double-quoted)
            const timeCondition = (status === ExamSessionStatus.UPCOMING
                ? Prisma.sql`AND es."startAt" > ${currentDate}`
                : (status === ExamSessionStatus.OPEN
                    ? Prisma.sql`AND es."startAt" <= ${currentDate} AND es."expireAt" > ${currentDate}`
                    : (status === ExamSessionStatus.EXPIRED
                        ? Prisma.sql`AND es."expireAt" <= ${currentDate}`
                        : Prisma.empty)));

            // 2. Status Conditions (Using EXISTS for performance)
            const etStatusCondition = status === ExamSessionStatus.PENDING
                ? Prisma.sql`AND EXISTS (SELECT 1 FROM "Exam_taken" et WHERE et."session_id" = es."session_id" AND et."exam_id" = es."exam_id" AND et."student_uid" = ${student_id} AND et."isDone" = false)`
                : status === ExamSessionStatus.COMPLETED
                    ? Prisma.sql`AND EXISTS (SELECT 1 FROM "Exam_taken" et WHERE et."session_id" = es."session_id" AND et."exam_id" = es."exam_id" AND et."student_uid" = ${student_id} AND et."isDone" = true)`
                    : Prisma.empty;

            // 3. The Main Query
            const sessions = await this.prisma.$queryRaw`
                SELECT 
                    es.session_id, es.exam_id, es.limit_taken, es."startAt", es."expireAt", es.exam_type,
                    json_build_object(
                        'exam_id', e.exam_id,
                        'title', e.title,
                        'duration', e.duration,
                        'total_ques', e.total_ques
                    ) AS exam,
                    -- Nesting JSON for the many-to-many relationship (class names)
                    (
                        SELECT json_agg(json_build_object('class_id', eoi.class_id, 'classname', c.classname))
                        FROM "Exam_open_in" eoi
                        JOIN "Class" c ON eoi.class_id = c.class_id
                        WHERE eoi.session_id = es.session_id AND eoi.exam_id = es.exam_id
                    ) AS exam_open_in,
                    -- Nesting JSON for the specific student's attempts
                    (
                        SELECT json_agg(json_build_object(
                            'et_id', et.et_id, 
                            'isDone', et."isDone", 
                            'final_score', et.final_score, 
                            'doneAt', et."doneAt"
                        ))
                        FROM "Exam_taken" et
                        WHERE et.session_id = es.session_id AND et.exam_id = es.exam_id AND et.student_uid = ${student_id}
                    ) AS exam_takens,
                    (
                        SELECT COUNT(*) FROM "Exam_taken" et 
                        WHERE et."session_id" = es."session_id" 
                        AND et."exam_id" = es."exam_id" 
                        AND et."student_uid" = ${student_id}
                    ) AS attempt_count
                FROM "Exam_session" es
                JOIN "Exams" e ON es.exam_id = e.exam_id
                WHERE 
                    -- Enrollment check: Session must be open in a class the student is in
                    EXISTS (
                        SELECT 1 FROM "Exam_open_in" eoi
                        JOIN "Learning" l ON eoi.class_id = l.class_id
                        WHERE eoi.session_id = es.session_id 
                        AND eoi.exam_id = es.exam_id 
                        AND l.student_uid = ${student_id}
                    )
                    -- Limit check: Current student's total attempts < session limit
                    AND (
                        SELECT COUNT(*) FROM "Exam_taken" et 
                        WHERE et.session_id = es.session_id 
                        AND et.exam_id = es.exam_id 
                        AND et.student_uid = ${student_id}
                    ) < es.limit_taken
                    ${timeCondition}
                    ${etStatusCondition}
                ORDER BY es."startAt" ASC, es."expireAt" ASC
                LIMIT ${limit} OFFSET ${offset}
            `;

            return sessions;
        } catch (error) {
            console.error("Raw Query Error:", error);
            throw new InternalServerErrorException(error.message);
        }
    }
}