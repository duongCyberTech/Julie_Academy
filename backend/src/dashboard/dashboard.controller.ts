import { 
    Controller,
    Get
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get("register-stats")
    async getRegisterStats() {
        return this.dashboardService.getRegisterStatsByWeek();
    }

    @Get("class-created-stats")
    async getClassCreatedStats() {
        return this.dashboardService.getClassCreatedStatsByWeek();
    }

    @Get("exam-taken-stats")
    async getExamTakenStats() {
        return this.dashboardService.getNumberOfExamTakenByWeek();
    }

    @Get("number-of-active-classes")
    async getNumberOfActiveClasses() {
        return this.dashboardService.getNumberOfActiveClasses();
    }

    @Get("number-of-questions")
    async getNumberOfQuestions() {
        return this.dashboardService.getNumberOfQuestions();
    }
}
