import { Module } from "@nestjs/common";
import { AdminConfigController, AnalysisController, TutorAnalysisController } from "./analysis.controller";
import { AdminConfigService, AnalysisService, TutorAnalysisService } from "./analysis.service";

@Module({
  imports: [],
  controllers: [AnalysisController, AdminConfigController, TutorAnalysisController],
  providers: [AnalysisService, AdminConfigService, TutorAnalysisService],
  exports: [AnalysisService, AdminConfigService, TutorAnalysisService],
})
export class AnalysisModule {}