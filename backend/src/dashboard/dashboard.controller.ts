import { 
    Controller,
    Get,
    Param,
    UseGuards
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { Roles } from "src/auth/decorator/roles.decorator";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('admin-stats')
    @Roles('tutor')
    getAdminStats(){
        return this.dashboardService.getAdminStats()
    }

    @Get('tutor-stats/:tutor_id')
    @Roles('tutor')
    getTutorStats(
        @Param('tutor_id') tutor_id: string
    ){
        return this.dashboardService.getTutorStats(tutor_id)
    }
}
