import { 
    Injectable 
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AnalyticsDto } from "./dto/analysis.dto";

import { ActionConfigDto, LevelConfigDto } from "src/analysis/dto/analysis.dto";

@Injectable()
export class AdminConfigService {
    constructor(
        private prisma: PrismaService
    ) {}

    async createNewLevelConfig(exp_required: LevelConfigDto) {
        return await this.prisma.levelConfig.create({
            data: {
                ...exp_required
            }
        });
    }

    async getAllLevelConfigs() {
        return await this.prisma.levelConfig.findMany({
            orderBy: {
                level: 'asc'
            }
        });
    }

    async createNewActionConfig(title: string, description: string, drops_claim: number) {
        return await this.prisma.actionConfig.create({
            data: {
                title,
                description,
                drops_claim
            }
        });
    }

    async getAllActionConfigs() {
        return await this.prisma.actionConfig.findMany({
            orderBy: {
                title: 'asc'
            }
        });
    }

    async updateLevelConfig(level: number, data: LevelConfigDto) {
        return await this.prisma.levelConfig.update({
            where: { level },
            data: { ...data }
        });
    }

    async updateActionConfig(action_id: string, data: Partial<ActionConfigDto>) {
        return await this.prisma.actionConfig.update({
            where: { action_id },
            data: { ...data }
        });
    }
}

@Injectable()
export class AnalysisService {
    constructor(
        private prisma: PrismaService
    ) {}

    async createOrUpdateAnalytics(uid: string, data: Partial<AnalyticsDto>) {
        const {streak_trigger, ...newData} = data
        const existingData = await this.prisma.student_analytics.findFirst({
            where: { student_id: uid }
        })

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const activityDate = existingData?.last_activity_at 
            ? new Date(existingData.last_activity_at) 
            : new Date();

        activityDate.setHours(0, 0, 0, 0);

        const diffInMs = now.getTime() - activityDate.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (streak_trigger && existingData && diffInDays <= 1) {
            return await this.prisma.student_analytics.update({
                where: {student_id: uid},
                data: {
                    streak: {increment: 1},
                    water_drops: {increment: newData.water_drops ?? 0},
                    experience: { increment: newData.experience ?? 0 },
                    last_activity_at: new Date()
                }
            })
        }

        return await this.prisma.student_analytics.upsert({
            where: { student_id: uid },
            update: {
                water_drops: {increment: newData.water_drops ?? 0},
                experience: { increment: newData.experience ?? 0 },
                last_activity_at: new Date(),
                ...(streak_trigger ? {streak: 1} : {})
            },
            create: {
                student: {connect: {uid}},
                streak: 1,
                last_activity_at: new Date(),
                ...newData
            }
        });
    }

    async getAnalytics(uid: string) {
        return await this.prisma.student_analytics.findUnique({
            where: { student_id: uid }
        });
    }
}