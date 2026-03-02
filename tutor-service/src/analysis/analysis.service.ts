import { 
    Injectable 
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AnalyticsDto } from "./dto/analysis.dto";

@Injectable()
export class AnalysisService {
    constructor(
        private prisma: PrismaService
    ) {}

    async createOrUpdateAnalytics(uid: string, data: Partial<AnalyticsDto>) {
        const existingAnalytics = await this.prisma.student_analytics.findUnique({
            where: { student_id: uid }
        });

        if (existingAnalytics) {
            let toggleStreak = false
            if (data.last_exam_taken_date) {
                const lastExamDate = existingAnalytics.last_exam_taken_date;
                const currentExamDate = data.last_exam_taken_date;
                const diffTime = Math.abs(currentExamDate.getTime() - lastExamDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 1) toggleStreak = true
            }

            return await this.prisma.student_analytics.update({
                where: { student_id: uid },
                data: {
                    ...(data.sum_exam_adaptive ? 
                        {sum_exam_adaptive: {increment: 1}} : 
                        {}),
                    ...(data.max_score_practice && data.max_score_practice > existingAnalytics.max_score_practice ? 
                        {max_score_practice: data.max_score_practice} : 
                        {}),
                    ...(data.max_thread_comment && data.max_thread_comment > existingAnalytics.max_thread_comment ? 
                        {max_thread_comment: data.max_thread_comment} : 
                        {}),
                    ...(data.sum_exam ? 
                        {sum_exam: {increment: 1}} :
                        {}),
                    ...(data.percentage_question_correct ?
                        {percentage_question_correct: data.percentage_question_correct} :
                        {}),
                    ...(data.incre_percentage_question_correct ?
                        {incre_percentage_question_correct: data.incre_percentage_question_correct} :
                        {}),
                    ...(toggleStreak ? 
                        {streak: {increment: 1}} :
                        {}),
                    ...(data.last_exam_taken_date ? 
                        {last_exam_taken_date: data.last_exam_taken_date} :
                        {}),
                    ...(data.sign_up_date ?
                        {sign_up_date: data.sign_up_date} :
                        {})
                }
            })
        }

        return await this.prisma.student_analytics.create({
            data: {
                student_id: uid,
                sum_exam_adaptive: data.sum_exam_adaptive || 0,
                max_score_practice: data.max_score_practice || 0,
                max_thread_comment: data.max_thread_comment || 0,
                sum_exam: data.sum_exam || 0,
                percentage_question_correct: data.percentage_question_correct || 0,
                incre_percentage_question_correct: data.incre_percentage_question_correct || 0,
                streak: data.streak || 0,
                last_exam_taken_date: data.last_exam_taken_date || null,
                sign_up_date: data.sign_up_date || null
            }
        })
    }

    async getAnalytics(uid: string) {
        return await this.prisma.student_analytics.findUnique({
            where: { student_id: uid }
        });
    }
}