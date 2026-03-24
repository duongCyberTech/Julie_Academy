import { 
    Controller,
    Get,
    Param,
    UseGuards,
    Request,
    ParseIntPipe,
    Query
} from "@nestjs/common";
import { DashboardService, TutorDashboard } from "./dashboard.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { Roles } from "src/auth/decorator/roles.decorator";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly tutorDashboard: TutorDashboard
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
}
