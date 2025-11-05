import { Module } from "@nestjs/common";
// Dashboard Module
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

// Import other necessary modules
import { PrismaModule } from "src/prisma/prisma.module";


@Module({
    controllers: [DashboardController],
    providers: [DashboardService],
    imports: [PrismaModule],
})
export class DashboardModule {}
