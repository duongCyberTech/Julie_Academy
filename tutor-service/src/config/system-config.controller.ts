import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { SystemConfigService } from "./system-config.service";
import { Roles } from "src/auth/decorator/roles.decorator";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";

@Controller('system-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get()
  getConfig() {
    return this.systemConfigService.getConfig();
  }

  @Patch()
  updateConfig(@Body() newConfig: Record<string, any>) {
    return this.systemConfigService.updateConfig(newConfig);
  }
}