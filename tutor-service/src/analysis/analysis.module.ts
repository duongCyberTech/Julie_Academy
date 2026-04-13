import { Module } from "@nestjs/common";
import { AdminConfigController, AnalysisController } from "./analysis.controller";
import { AdminConfigService, AnalysisService } from "./analysis.service";

@Module({
  imports: [],
  controllers: [AnalysisController, AdminConfigController],
  providers: [AnalysisService, AdminConfigService],
  exports: [AnalysisService, AdminConfigService],
})
export class AnalysisModule {}