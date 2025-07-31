import { Controller, Body, UnauthorizedException,Post } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    console.log(">>> Login Input: ", dto)
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException();
    return this.authService.login(user);       
  }

  @Post('register')
  async register(@Body() dto: RegisterDto){
    return this.userService.createUser(dto)
  }
}
