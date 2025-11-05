import {
    Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async getRegisterStatsByWeek() {
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
        console.log('Users registered in last 7 days:', users);
        const result = users.reduce((acc, user) => {
            const dateKey = user.createAt.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = 0;
            }
            acc[dateKey]++;
            return acc;
        }, {});
        return Object.entries(result).map(([date, value]) => (value));
    }

    async getClassCreatedStatsByWeek() {
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
        const result = classes.reduce((acc, cls) => {
            const dateKey = cls.createdAt.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = 0;
            }
            acc[dateKey]++;
            return acc;
        }, {});
        return Object.entries(result).map(([date, value]) => (value));
    }

    async getNumberOfExamTakenByWeek() {
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
        console.log('Exams taken in last 7 days:', examResults);
        const result = examResults.reduce((acc, exam) => {
            const dateKey = exam.startAt.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = 0;
            }
            acc[dateKey]++;
            return acc;
        }, {});
        return Object.entries(result).map(([date, value]) => (value));
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