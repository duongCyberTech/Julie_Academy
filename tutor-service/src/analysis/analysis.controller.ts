import { 
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
    Request
} from "@nestjs/common";
import { AdminConfigService, AnalysisService } from "./analysis.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { ActionConfigDto, AnalyticsDto, LevelConfigDto } from "./dto/analysis.dto";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { Roles } from "src/auth/decorator/roles.decorator";

@Controller('analysis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalysisController {
    constructor(
        private analysisService: AnalysisService
    ) {}

    @Get(':student_id')
    getAnalytics(@Param('student_id') studentId: string) {
        return this.analysisService.getAnalytics(studentId);
    }

    @Patch('watering')
    wateringPlant(
        @Request() req: any,
        @Body() data: Partial<AnalyticsDto>
    ) {
        const uid = req.user.userId
        return this.analysisService.createOrUpdateAnalytics(uid, data)
    }
}

@Controller('admin/config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminConfigController {
    constructor(
        private adminConfigService: AdminConfigService
    ) {}

    @Post('level')
    createLevelConfig(@Body() levelConfig: LevelConfigDto) {
        return this.adminConfigService.createNewLevelConfig(levelConfig);
    }

    @Get('level')
    getAllLevelConfigs() {
        return this.adminConfigService.getAllLevelConfigs();
    }

    @Post('action')
    createActionConfig(@Body() body: { title: string, description: string, drops_claim: number }) {
        const { title, description, drops_claim } = body;
        return this.adminConfigService.createNewActionConfig(title, description, drops_claim);
    }

    @Get('action')
    getAllActionConfigs() {
        return this.adminConfigService.getAllActionConfigs();
    }

    @Patch('level')
    updateLevelConfig(
        @Param('level', ParseIntPipe) level: number,
        @Body() body: LevelConfigDto
    ) {
        return this.adminConfigService.updateLevelConfig(level, body);
    }

    @Patch('action/:action_id')
    updateActionConfig(
        @Param('action_id') action_id: string,
        @Body() body: Partial<ActionConfigDto>
    ) {
        return this.adminConfigService.updateActionConfig(action_id, body);
    }
}