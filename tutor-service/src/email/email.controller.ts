import { 
  Body, 
  Controller, 
  Param,
  Request, 
  Post,
  Get,
  Patch,
  Delete
} from "@nestjs/common";
import { EmailService } from "./email.service";
import { EmailConfigDto } from "./dto/email.dto";

@Controller('email-chain')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
  ) {}

  @Post(':class_id')
  createEmailChain(
    @Request() req: any, 
    @Param('class_id') class_id: string, 
    @Body() data: EmailConfigDto
  ) {
    return this.emailService.createEmailConfig(req.user.tutor_id, class_id, data);
  }

  @Get(':class_id')
  getAllEmailChains(
    @Request() req: any,
    @Param('class_id') class_id: string
  ) {
    return this.emailService.getAllEmailChainsOfClass(req.user.tutor_id, class_id);
  }

  @Get(':class_id/:config_id')
  getEmailChainById(
    @Request() req: any,
    @Param('class_id') class_id: string,
    @Param('config_id') config_id: string
  ) {
    return this.emailService.getEmailChainById(req.user.tutor_id, class_id, config_id);
  }

  @Patch(':config_id')
  updateEmailChainById(
    @Request() req: any,
    @Param('config_id') config_id: string,
    @Body() data: Partial<EmailConfigDto>
  ) {
    return this.emailService.updateEmailChainById(req.user.tutor_id, config_id, data);
  }

  @Delete(':config_id')
  deleteEmailChainById(
    @Request() req: any,
    @Param('config_id') config_id: string
  ) {
    return this.emailService.deleteEmailChainById(req.user.tutor_id, config_id);
  }
}