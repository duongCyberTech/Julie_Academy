import {
    Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FilterDTO } from './dto/filter.dto';

@Injectable()
export class StudentDashboard {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async scoreOfLatestTest(student_id: string) {
        return await this.prisma.exam_taken.findFirst({
            where: {isDone: true, student_uid: student_id},
            select: {final_score: true},
            orderBy: {doneAt: "desc"}
        }).then(res => res.final_score)
    }

    async currentClasses(student_id: string) {
        return await this.prisma.class.findMany({
            where: {
                learning: {some: {student_uid: student_id}},
                status: {in: ["pending", "ongoing"]}
            },
            select: {
                subject: true
            }
        }).then(res => ({
            total_classes: res.length,
            subjects: [...new Set(res.map(klass => klass.subject))] 
        }))
    }

    async totalPracticeTime(student_id: string) {
        return await this.prisma.exam_taken.findMany({
            where: {
                isDone: true, 
                student_uid: student_id,
                exam_id: null,
                session_id: null
            },
            select: {
                doneAt: true,
                startAt: true
            }
        }).then(res => res.reduce((acc, cur) => acc + (cur.doneAt.getTime() - cur.startAt.getTime()), 0) / (1000 * 60 * 60))
    }

    async currentActivities(student_id: string, filter: Partial<FilterDTO>) {
        return await this.prisma.exam_taken.findMany({
            where: {
                student_uid: student_id,
                isDone: true,
                ...(filter.startAt ? {startAt: {gte: filter.startAt}} : {}),
                ...(filter.endAt ? {doneAt: {lte: filter.endAt}} : {})
            },
            select: {
                exam_session: {
                    select: {
                        exam: {
                            select: {
                                title: true
                            }
                        },
                        exam_open_in: {
                            select: {
                                class: {
                                    select: {
                                        subject: true
                                    }
                                }
                            }
                        }
                    }
                },
                final_score: true,
                doneAt: true
            },
            orderBy: [
                {doneAt: "desc"},
                {startAt: "desc"}
            ],
            take: (filter.limit ?? 10),
            skip: ((filter.page ?? 1) - 1) * (filter.limit ?? 10)
        }).then(res => res.map(ex => ({
            title: ex.exam_session.exam.title,
            subject: ex.exam_session.exam_open_in[0].class.subject,
            score: ex.final_score,
            doneAt: ex.doneAt
        }))).catch(err => [])
    }
}

@Injectable()
export class AdminDashboard {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async getRegisterStatsByWeek() {
        var stats = Array(7).fill({ date: '', value: 0 }).map((item, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            return { date: date.toISOString().split('T')[0], value: 0 };
        });
        const nextOfToday = new Date();
        nextOfToday.setDate(nextOfToday.getDate() + 1);
        const _7daysAgo = new Date();
        _7daysAgo.setDate(nextOfToday.getDate() - 8);
        const users = await this.prisma.user.findMany({
            where: {
                createAt: {
                    gte: _7daysAgo,
                    lte: nextOfToday,
                },
                OR : [
                    { role: 'student' },
                    { role: 'tutor' }
                ]
            },
            orderBy: { createAt: 'asc' },
        });

        stats = stats.map((item) => {
            const userForDate = users.filter((user) => {
                const dateKey = user.createAt.toISOString().split('T')[0];
                return dateKey === item.date;
            });
            return {
                date: item.date,
                value: userForDate.length,
            };
        });

        return stats.map(item => item.value);
    }

    async getClassCreatedStatsByWeek() {
        var stats = Array(7).fill({ date: '', value: 0 }).map((item, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            return { date: date.toISOString().split('T')[0], value: 0 };
        });

        const nextOfToday = new Date();
        nextOfToday.setDate(nextOfToday.getDate() + 1);
        const _7daysAgo = new Date();
        _7daysAgo.setDate(nextOfToday.getDate() - 8);
        const classes = await this.prisma.class.findMany({
            where: {
                createdAt: {
                    gte: _7daysAgo,
                    lte: nextOfToday,
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        
        stats = stats.map((item) => {
            const classesForDate = classes.filter((cls) => {
                const dateKey = cls.createdAt.toISOString().split('T')[0];
                return dateKey === item.date;
            });
            return {
                date: item.date,
                value: classesForDate.length,
            };
        });
        return stats.map(item => item.value);
    }

    async getNumberOfExamTakenByWeek() {
        var stats = Array(7).fill({ date: '', value: 0 }).map((item, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            return { date: date.toISOString().split('T')[0], value: 0 };
        });

        const nextOfToday = new Date();
        nextOfToday.setDate(nextOfToday.getDate() + 1);
        const _7daysAgo = new Date();
        _7daysAgo.setDate(nextOfToday.getDate() - 8);
        const examResults = await this.prisma.exam_taken.findMany({
            where: {
                startAt: {
                    gte: _7daysAgo,
                    lte: nextOfToday,
                },
            },
            orderBy: { startAt: 'asc' },
        });

        stats = stats.map((item) => {
            const examsForDate = examResults.filter((exam) => {
                const dateKey = exam.startAt.toISOString().split('T')[0];
                return dateKey === item.date;
            });
            return {
                date: item.date,
                value: examsForDate.length,
            };
        });

        return stats.map(item => item.value);
    }

    async getNumberOfActiveClasses() {
        const activeClassesCount = await this.prisma.class.count({
            where: {
                status: 'ongoing',
            },
        });
        return activeClassesCount;
    }

    async getNumberOfQuestions() {
        const questionsCount = await this.prisma.questions.count();
        return questionsCount;
    }
}

@Injectable()
export class TutorDashboard {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async getNumStudentsOfTutor(tutor_id: string){
        return this.prisma.student.count({
            where: {
                learning: {
                    some: { class: {tutor: { uid: tutor_id }} }
                }
            }
        })
    }

    async getNumClasses(tutor_id: string){
        return this.prisma.class.count({
            where: {tutor: {uid: tutor_id}}
        })
    }

    async getNumLessonPlan(tutor_id: string){
        return this.prisma.lesson_Plan.count({
            where: {
                tutor: { uid: tutor_id }
            }
        })
    }

    async getNumMyQuestion(tutor_id: string){
        return this.prisma.questions.count({
            where: {
                tutor: {uid: tutor_id}
            }
        })
    }

    async getTodayUpcomingSchedule(tutor_id: string){
        try {
            const currentDate = new Date()
            const upcomingSchedules = await this.prisma.$queryRaw(
                Prisma.sql`
                    SELECT s.*, c."classname", c."subject", c."grade"
                    FROM public."Schedule" as s
                    join public."Class" as c on s."class_id" = c."class_id"
                    where
                        c."tutor_uid" = ${tutor_id} AND
                        s."meeting_date" = ${(currentDate.getDay() == 0 ? 8 : currentDate.getDay() + 1)}
                    order by s."startAt"
                `)

            return upcomingSchedules || []
        } catch (error) {
            return []
        }
    }

    async getWeeklyClassESProgress(tutor_id: string, day_range: number = 1) {
        try {
            const currentDate = new Date()
            const _ndaysAgo = new Date()
            _ndaysAgo.setDate(currentDate.getDate() - day_range)
            currentDate.setHours(23, 59, 59, 999)
            _ndaysAgo.setHours(0, 0, 0, 0)

            const cntClassStudent: {
                class_id: string,
                classname: string
                total_students: number
            }[] = await this.prisma.$queryRaw`
                SELECT 
                    c.class_id, 
                    c.classname
                    COUNT(DISTINCT s.uid) as total_students
                FROM public."Student" as s
                JOIN public."Learning" as l on s."uid" = l."student_uid"
                JOIN public."Class" as c on c."class_id" = l."class_id"
                WHERE c."tutor_uid" = ${tutor_id}
                GROUP BY c.class_id, c.classname
            `

            const cntESDone: {
                class_id: string,
                exam_id: string,
                session_id: number,
                total_students_done: number
            }[] = await this.prisma.$queryRaw`
                SELECT 
                    c.class_id, 
                    es."exam_id", es."session_id",
                    COUNT(DISTINCT s.uid) as total_students_done
                FROM public."Student" as s
                JOIN public."Exam_taken" as et on et."student_uid" = s."uid"
                JOIN public."Exam_session" as es on et."session_id" = es."session_id" and et."exam_id" = es."exam_id"
                JOIN public."Exam_open_in" as eoi on eoi."session_id" = es."session_id" and eoi."exam_id" = es."exam_id"
                JOIN public."Class" as c on eoi."class_id" = c."class_id"
                WHERE c."tutor_uid" = ${tutor_id}
                GROUP BY c.class_id, es."exam_id", es."session_id"
            `

            const cntMapper = cntESDone.map(item => ({
                class_id: item.class_id,
                classname: cntClassStudent.find(i => i.class_id == item.class_id).classname,
                exam_id: item.exam_id,
                session_id: item.session_id,
                num_students_done: item.total_students_done,
                total_class_students: cntClassStudent.find(i => i.class_id == item.class_id).total_students
            }))

            return cntMapper
        } catch (error) {
            return []
        }
    }

    async getDangerCategories(tutor_id: string) {
        try {
            const noticeCategories: {
                category_id: string,
                category_name: string,
                correct_cnt: number,
                fail_cnt: number
            }[] = await this.prisma.$queryRaw`
                SELECT 
                    c."category_id", 
                    c."category_name",
                    COUNT(CASE WHEN qet."isCorrect" = true THEN 1 END) AS correct_cnt,
                    COUNT(CASE WHEN qet."isCorrect" = false THEN 1 END) AS fail_cnt
                FROM public."Categories" AS c
                JOIN public."Structure" AS st ON c."category_id" = st."cate_id"
                JOIN public."Lesson_Plan" AS lp ON st."plan_id" = lp."plan_id"
                -- Joining the questions and results into the main flow
                JOIN public."Questions" AS q ON c."category_id" = q."category_id"
                JOIN public."Question_for_exam_taken" AS qet ON q."ques_id" = qet."ques_id"
                WHERE lp."tutor_id" = ${tutor_id}
                GROUP BY c."category_id", c."category_name";
            `

            return noticeCategories || []
        } catch (error) {
            return []
        }
    }
}

@Injectable()
export class DashboardService {
    constructor(
        private readonly admin: AdminDashboard,
        private readonly tutor: TutorDashboard,
        private readonly student: StudentDashboard
    ) {}

    async getAdminStats(){
        const numRegByWeek = await this.admin.getRegisterStatsByWeek()
        const numClassCreatedByWeek = await this.admin.getClassCreatedStatsByWeek()
        const numExamTakenByWeek = await this.admin.getNumberOfExamTakenByWeek()
        const numActiveClasses = await this.admin.getNumberOfActiveClasses()
        const numQuestion = await this.admin.getNumberOfQuestions()

        return {
            numRegByWeek,
            numClassCreatedByWeek,
            numExamTakenByWeek,
            numActiveClasses,
            numQuestion
        }
    }   
    
    async getTutorStats(tutor_id: string) {
        const numStudent = await this.tutor.getNumStudentsOfTutor(tutor_id)
        const numClasses = await this.tutor.getNumClasses(tutor_id)
        const numLessonPlan = await this.tutor.getNumLessonPlan(tutor_id)
        const numQuestions = await this.tutor.getNumMyQuestion(tutor_id)
        const upcomingSchedules = await this.tutor.getTodayUpcomingSchedule(tutor_id)
        const noticeCategories = await this.tutor.getDangerCategories(tutor_id)

        return {
            numStudent,
            numClasses,
            numLessonPlan,
            numQuestions,
            upcomingSchedules,
            noticeCategories
        }
    }

    async getStudentOverallStats(student_id: string) {
        const latestScore = await this.student.scoreOfLatestTest(student_id)
        const totalPracticeTime = await this.student.totalPracticeTime(student_id)
        const numJoinClassess = await this.student.currentClasses(student_id)

        return {
            latestScore,
            totalPracticeTime,
            numJoinClassess
        }
    }
}