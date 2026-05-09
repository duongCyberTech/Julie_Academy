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
    const isMantananceMode = this.systemConfigService.validateConfig({key: 'maintenance_mode', value: true});
    if (user.role !== 'admin' && isMantananceMode) throw new UnauthorizedException("Hệ thống đang bảo trì!");
    if (user.status === 'inactive') throw new UnauthorizedException("Tài khoản không hoạt động!");
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
    if (isMantananceMode) throw new UnauthorizedException("Hệ thống đang bảo trì!");
    if (!isRegisterEnabled) throw new UnauthorizedException("Chức năng đăng ký hiện tại đang bị tắt.");
    const user = await this.userService.createUser(dto as UserDto);
    return user;
  }
}

