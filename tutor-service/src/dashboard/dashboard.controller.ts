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
import { DashboardService, StudentDashboard, TutorDashboard } from "./dashboard.service";
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
    getExamSessionStats(
        @Query('day_range', ParseIntPipe) day_range: number,
        @Request() req
    ) {
        const uid = req.user.userId
        return this.tutorDashboard.getWeeklyClassESProgress(uid, day_range)
    }

    @Get('tutor-stats/:tutor_id')
    @Roles('tutor')
    getTutorStats(
        @Param('tutor_id') tutor_id: string
    ){
        return this.dashboardService.getTutorStats(tutor_id)
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

       return this.studentDashboard.skillsMap(req.user.userId, plan_id)
    }
}
@Get('student/skills-map')
    @Roles('student')
    getSkillsMap(
        @Query('plan_id', ParseUUIDPipe) plan_id: string,
        @Request() req
    ) {
        if (!plan_id) return []
     