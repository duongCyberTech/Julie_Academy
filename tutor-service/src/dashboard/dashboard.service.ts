import {
    Injectable,
} from '@nestjs/common';
import { StudentDashboard } from './role-based-dashboard/student.dashboard';
import { TutorDashboard } from './role-based-dashboard/tutor.dashboard';
import { AdminDashboard } from './role-based-dashboard/admin.dashboard';

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
        const avgTestScore = await this.student.averageTestScore(student_id)

        return {
            latestScore,
            totalPracticeTime,
            numJoinClassess,
            avgTestScore
        }
    }
}