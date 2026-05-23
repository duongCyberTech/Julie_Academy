import { 
  Body, 
  Controller, 
  Param,
  Request, 
  Post,
  Get,
  Patch,
  Delete,
  UseGuards
} from "@nestjs/common";
import { EmailService } from "./email.service";
import { EmailConfigDto } from "./dto/email.dto";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { Roles } from "src/auth/decorator/roles.decorator";

@Controller('email-chain')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
  ) {}

  @Post(':class_id')
  @Roles('tutor')
  createEmailChain(
    @Request() req: any, 
    @Param('class_id') class_id: string, 
    @Body() data: EmailConfigDto
  ) {
    return this.emailService.createEmailConfig(req.user.userId, class_id, data);
  }

  @Get()
  getAllEmailChains(
    @Request() req: any
  ) {
    return this.emailService.getAllEmailChains(req.user.userId)
  }

  @Get('class/:class_id')
  getAllEmailChainsByClass(
    @Request() req: any,
    @Param('class_id') class_id: string
  ) {
    return this.emailService.getAllEmailChainsOfClass(req.user.userId, class_id);
  }

  @Get('config/:config_id')
  getEmailChainById(
    @Request() req: any,
    @Param('config_id') config_id: string
  ) {
    return this.emailService.getEmailChainById(req.user.userId, config_id);
  }

  @Patch(':config_id')
  updateEmailChainById(
    @Request() req: any,
    @Param('config_id') config_id: string,
    @Body() data: Partial<EmailConfigDto>
  ) {
    return this.emailService.updateEmailChainById(req.user.userId, config_id, data);
  }

  @Delete(':config_id')
  deleteEmailChainById(
    @Request() req: any,
    @Param('config_id') config_id: string
  ) {
    return this.emailService.deleteEmailChainById(req.user.userId, config_id);
  }
  @Get('templates/all')
  getAllTemplates(@Request() req: any) {
    return this.emailService.getAllTemplates(req.user.userId);
  }

  @Get('logs')
  getEmailLogs(@Request() req: any) {
    return this.emailService.viewEmailLogs(req.user.userId);
  }

  @Get(':config_id/logs')
  getEmailLogsByConfig(
    @Request() req: any,
    @Param('config_id') config_id: string
  ) {
    return this.emailService.viewEmailLogsByConfig(req.user.userId, config_id);
  }
}