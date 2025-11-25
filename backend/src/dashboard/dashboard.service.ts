import {
    Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
        console.log('Classes created in last 7 days:', classes);
        
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
}

@Injectable()
export class DashboardService {
    constructor(
        private readonly admin: AdminDashboard,
        private readonly tutor: TutorDashboard
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
    
    async getTutorStats(tutor_id) {
        const numStudent = await this.tutor.getNumStudentsOfTutor(tutor_id)
        const numClasses = await this.tutor.getNumClasses(tutor_id)
        const numLessonPlan = await this.tutor.getNumLessonPlan(tutor_id)
        const numQuestions = await this.tutor.getNumMyQuestion(tutor_id)

        return {
            numStudent,
            numClasses,
            numLessonPlan,
            numQuestions
        }
    }
}