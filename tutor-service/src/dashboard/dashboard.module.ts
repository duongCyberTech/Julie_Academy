import { Module } from "@nestjs/common";
// Dashboard Module
import { DashboardController } from "./dashboard.controller";
import { StudentDashboard } from './role-based-dashboard/student.dashboard';
import { TutorDashboard } from './role-based-dashboard/tutor.dashboard';
import { AdminDashboard } from './role-based-dashboard/admin.dashboard';
import { ParentDashboard } from './role-based-dashboard/parents.dashboard';
import { DashboardService } from "./dashboard.service";

// Import other necessary modules
import { PrismaModule } from "src/prisma/prisma.module";
import { QuestionModule } from "src/question/question.module";
import { AnalysisModule } from "src/analysis/analysis.module";
import { AwsCloudWatchGateway } from "./aws-cloudwatch/aws_cloudwatch.gateway";
import { ApiMetricsService } from "./metrics/api-metrics.service";
import { BackgroundJobModule } from "src/background_job/background-job.module";

@Module({
    controllers: [DashboardController],
    providers: [DashboardService, AdminDashboard, TutorDashboard, StudentDashboard, ParentDashboard, AwsCloudWatchGateway, ApiMetricsService],
    imports: [PrismaModule, QuestionModule, AnalysisModule, BackgroundJobModule],
    exports: [ApiMetricsService]
})
export class DashboardModule {}