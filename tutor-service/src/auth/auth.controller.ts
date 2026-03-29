import { Controller, Body, UnauthorizedException,Post, NotFoundException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { AnalysisService } from "src/analysis/analysis.service";
import { Throttle } from "@nestjs/throttler";
import { UserDto } from "src/user/dto/user.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private analysisService: AnalysisService
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new NotFoundException("Account not exist!");
    return this.authService.login(user);       
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto){
    const user = await this.userService.createUser(dto as UserDto);
    if (user && user.data.role === 'student') {
      await this.analysisService.createOrUpdateAnalytics(user.data.uid, {
        last_exam_taken_date: new Date(),
        sign_up_date: new Date(),
      });
    }
    return user;
  }
}

