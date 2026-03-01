import { 
    Controller,
    Get,
    Param
} from "@nestjs/common";
import { AnalysisService } from "./analysis.service";

@Controller('analysis')
export class AnalysisController {
    constructor(
        private analysisService: AnalysisService
    ) {}

    @Get(':student_id')
    getAnalytics(@Param('student_id') studentId: string) {
        return this.analysisService.getAnalytics(studentId);
    }
}