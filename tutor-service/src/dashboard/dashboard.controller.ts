import { 
    Controller,
    Get,
    Param,
    UseGuards,
    Request,
    ParseIntPipe,
    Query,
    ParseUUIDPipe,
    DefaultValuePipe
} from "@nestjs/common";
import { StudentDashboard } from './role-based-dashboard/student.dashboard';
import { TutorDashboard } from './role-based-dashboard/tutor.dashboard';
import { ParentDashboard } from './role-based-dashboard/parents.dashboard';
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { ParentOfStudentGuard } from "./guard/parent-of-student.guard";
import { Roles } from "src/auth/decorator/roles.decorator";
import { PartialFilterDTO } from "./dto/filter.dto";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly tutorDashboard: TutorDashboard,
        private readonly studentDashboard: StudentDashboard,
        private readonly parentDashboard: ParentDashboard
    ) {}

    @Get('admin-stats')
    @Roles('admin')
    getAdminStats(){
        return this.dashboardService.getAdminStats()
    }
        
    @Get('tutor-stats/:class_id/exam-session')
    @Roles('tutor')
    getExamSessionStats(
        @Query('day_range', new DefaultValuePipe(1), ParseIntPipe) day_range: number,
        @Param('class_id', ParseUUIDPipe) class_id: string,
        @Request() req: any
    ) {
        const uid = req.user.userId
        return this.tutorDashboard.getWeeklyClassESProgress(uid, class_id, day_range)
    }

    @Get('tutor-stats/student-attention')
    @Roles('tutor')
    getAttentionRequiredStudents(
        @Request() req: any,
        @Query() query: PartialFilterDTO
    ) {
        const uid = req.user.userId
        return this.tutorDashboard.attentionRequiredStudents(uid, query)
    }

    @Get('tutor-stats/overall')
    @Roles('tutor')
    getTutorStats(
        @Request() req: any
    ){
        const uid = req.user.userId
        return this.dashboardService.getTutorStats(uid)
    }

    @Get('student-stats')
    @Roles('student')
    getStudentStats(
        @Request() req: any
    ) {
        const uid = req.user.userId
        return this.dashboardService.getStudentOverallStats(uid)
    }

    @Get('student/current-test')
    @Roles('student')
    getStudentCurrentTest(
        @Request() req: any,
        @Query() query: PartialFilterDTO
    ) {
        const uid = req.user.userId
        return this.studentDashboard.currentActivities(uid, query)
    }

    @Get('student/score-trend')
    @Roles('student')
    getScoreTrend(
        @Query() query: PartialFilterDTO,
        @Request() req: any
    ) {
        const uid = req.user.userId
        return this.studentDashboard.scoreTrend(uid, query)
    }

    @Get('student/skills-map')
    @Roles('student')
    getSkillsMap(
        @Query('plan_id', ParseUUIDPipe) plan_id: string,
        @Request() req: any
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
        @Request() req: any
    ) {
        if (!plan_id || !chapter_id) return []
        return this.studentDashboard.skillsMapDetail(req.user.userId, plan_id, chapter_id)
    }

    // ============================================================
    //  PARENT DASHBOARD ENDPOINTS
    //  Mỗi endpoint nhận child_id ở route param và được
    //  ParentOfStudentGuard xác thực quan hệ phụ huynh - học sinh.
    // ============================================================

    @Get('parent/:child_id/overall-stats')
    @Roles('parents')
    @UseGuards(ParentOfStudentGuard)
    getParentChildOverallStats(
        @Param('child_id', ParseUUIDPipe) child_id: string
    ) {
        return this.parentDashboard.getOverallStatsForChild(child_id)
    }

    @Get('parent/:child_id/score-trend')
    @Roles('parents')
    @UseGuards(ParentOfStudentGuard)
    getParentChildScoreTrend(
        @Param('child_id', ParseUUIDPipe) child_id: string,
        @Query() query: PartialFilterDTO
    ) {
        return this.parentDashboard.scoreTrendForChild(child_id, query)
    }

    @Get('parent/:child_id/skills-map')
    @Roles('parents')
    @UseGuards(ParentOfStudentGuard)
    getParentChildSkillsMap(
        @Param('child_id', ParseUUIDPipe) child_id: string,
        @Query('plan_id', ParseUUIDPipe) plan_id: string
    ) {
        if (!plan_id) return []
        return this.parentDashboard.skillsMapForChild(child_id, plan_id)
    }

    @Get('parent/:child_id/skills-map/:chapter_id')
    @Roles('parents')
    @UseGuards(ParentOfStudentGuard)
    getParentChildSkillsMapDetail(
        @Param('child_id', ParseUUIDPipe) child_id: string,
        @Param('chapter_id') chapter_id: string,
        @Query('plan_id', ParseUUIDPipe) plan_id: string
    ) {
        if (!plan_id || !chapter_id) return []
        return this.parentDashboard.skillsMapDetailForChild(child_id, plan_id, chapter_id)
    }

    @Get('parent/:child_id/current-test')
    @Roles('parents')
    @UseGuards(ParentOfStudentGuard)
    getParentChildCurrentTest(
        @Param('child_id', ParseUUIDPipe) child_id: string,
        @Query() query: PartialFilterDTO
    ) {
        return this.parentDashboard.currentActivitiesForChild(child_id, query)
    }

    @Get('parent/:child_id/plans')
    @Roles('parents')
    @UseGuards(ParentOfStudentGuard)
    getParentChildPlans(
        @Param('child_id', ParseUUIDPipe) child_id: string
    ) {
        return this.parentDashboard.getPlansForChild(child_id)
    }
}