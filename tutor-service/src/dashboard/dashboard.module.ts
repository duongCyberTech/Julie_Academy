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
import { AnalysisModule } from "src/analysis/analysis.module";
import { AwsCloudWatchGateway } from "./aws-cloudwatch/aws_cloudwatch.gateway";
import { ApiMetricsService } from "./metrics/api-metrics.service";

@Module({
    controllers: [DashboardController],
    providers: [DashboardService, AdminDashboard, TutorDashboard, StudentDashboard, AwsCloudWatchGateway, ApiMetricsService],
    imports: [PrismaModule, QuestionModule, AnalysisModule],
    exports: [ApiMetricsService]
})
export class DashboardModule {}
