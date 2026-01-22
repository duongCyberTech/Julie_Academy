import { Module } from "@nestjs/common";
// Dashboard Module
import { DashboardController } from "./dashboard.controller";
import { DashboardService, AdminDashboard, TutorDashboard } from "./dashboard.service";

// Import other necessary modules
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    controllers: [DashboardController],
    providers: [DashboardService, AdminDashboard, TutorDashboard],
    imports: [PrismaModule],
})
export class DashboardModule {}
