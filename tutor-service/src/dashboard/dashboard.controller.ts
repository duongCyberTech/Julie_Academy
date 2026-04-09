import { 
    Controller,
    Get,
    Param,
    UseGuards,
    Request,
    ParseIntPipe,
    Query,
    ParseUUIDPipe
} from "@nestjs/common";
import { StudentDashboard } from './role-based-dashboard/student.dashboard';
import { TutorDashboard } from './role-based-dashboard/tutor.dashboard';
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { Roles } from "src/auth/decorator/roles.decorator";
import { FilterDTO } from "./dto/filter.dto";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly tutorDashboard: TutorDashboard,
        private readonly studentDashboard: StudentDashboard
    ) {}

    @Get('admin-stats')
    @Roles('admin')
    getAdminStats(){
        return this.dashboardService.getAdminStats()
    }
        
    @Get('tutor-stats/exam-session')
    @Roles('tutor')
    getExamSessionStats(
        @Query('day_range', ParseIntPipe) day_range: number,
        @Request() req
    ) {
        const uid = req.user.userId
        return this.tutorDashboard.getWeeklyClassESProgress(uid, day_range)
    }

    @Get('tutor-stats/student-attention')
    @Roles('tutor')
    getAttentionRequiredStudents(
        @Request() req,
        @Query() query: Partial<FilterDTO>
    ) {
        const uid = req.user.userId
        return this.tutorDashboard.attentionRequiredStudents(uid, query)
    }

    @Get('tutor-stats/overall')
    @Roles('tutor')
    getTutorStats(
        @Request() req
    ){
        const uid = req.user.userId
        return this.dashboardService.getTutorStats(uid)
    }

    @Get('student-stats')
    @Roles('student')
    getStudentStats(
        @Request() req
    ) {
        const uid = req.user.userId
        return this.dashboardService.getStudentOverallStats(uid)
    }

    @Get('student/current-test')
    @Roles('student')
    getStudentCurrentTest(
        @Request() req,
        @Query() query: Partial<FilterDTO>
    ) {
        const uid = req.user.userId
        return this.studentDashboard.currentActivities(uid, query)
    }

    @Get('student/score-trend')
    @Roles('student')
    getScoreTrend(
        @Query() query: Partial<FilterDTO>,
        @Request() req
    ) {
        const uid = req.user.userId
        return this.studentDashboard.scoreTrend(uid, query)
    }

    @Get('student/skills-map')
    @Roles('student')
    getSkillsMap(
        @Query('plan_id', ParseUUIDPipe) plan_id: string,
        @Request() req
    ) {
        if (!plan_id) return []
        return this.studentDashboard.skillsMap(req.user.userId, plan_id)
    }

    // I them: Chi tiết radar theo chương
    @Get('student/skills-map/:chapter_id')
    @Roles('student')
    getSkillsMapDetail(
        @Param('chapter_id') chapter_id: string,
        @Query('plan_id', ParseUUIDPipe) plan_id: string,
        @Request() req
    ) {
        if (!plan_id || !chapter_id) return []
        return this.studentDashboard.skillsMapDetail(req.user.userId, plan_id, chapter_id)
    }
}