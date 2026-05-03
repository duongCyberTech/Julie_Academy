import { Controller, Body, UnauthorizedException,Post, NotFoundException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { AnalysisService } from "src/analysis/analysis.service";
import { SystemConfigService } from "src/config/system-config.service";
import { Throttle } from "@nestjs/throttler";
import { UserDto } from "src/user/dto/user.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private analysisService: AnalysisService,
    private systemConfigService: SystemConfigService
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new NotFoundException("Account not exist!");
    const isMantananceMode = this.systemConfigService.validateConfig({key: 'maintenance_mode', value: true});
    if (user.role !== 'admin' && isMantananceMode) throw new UnauthorizedException("System is under maintenance!");
    if (user.status === 'inactive') throw new UnauthorizedException("Account is inactive!");
    try {
      await this.analysisService.createOrUpdateAnalytics(user.uid, {water_drops: 1})
    } catch(err) {

    }
    return this.authService.login(user);       
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto){
    const isMantananceMode = this.systemConfigService.validateConfig({key: 'maintenance_mode', value: true});
    const isRegisterEnabled = this.systemConfigService.validateConfig({key: 'register_allowance', value: true});
    if (isMantananceMode) throw new UnauthorizedException("System is under maintenance!");
    if (!isRegisterEnabled) throw new UnauthorizedException("Registration is currently disabled.");
    const user = await this.userService.createUser(dto as UserDto);
    return user;
  }
}

