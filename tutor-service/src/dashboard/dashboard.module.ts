import { Module } from "@nestjs/common";
// Dashboard Module
import { DashboardController } from "./dashboard.controller";
import { StudentDashboard } from './role-based-dashboard/student.dashboard';
import { TutorDashboard } from './role-based-dashboard/tutor.dashboard';
import { AdminDashboard } from './role-based-dashboard/admin.dashboard';
import { DashboardService } from "./dashboard.service";

// Import other necessary modules
import { PrismaModule } from "src/prisma/prisma.module";
import { QuestionModule } from "src/question/question.module";

@Module({
    controllers: [DashboardController],
    providers: [DashboardService, AdminDashboard, TutorDashboard, StudentDashboard],
    imports: [PrismaModule, QuestionModule],
})
export class DashboardModule {}
