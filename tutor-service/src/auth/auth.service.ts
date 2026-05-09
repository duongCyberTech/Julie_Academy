import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException("Tài khoản không tồn tại");
    const isMatched = await bcrypt.compare(pass, user?.password)
    if (user && isMatched) {
      const { password, ...result } = user;
      return result;
    }
    throw new BadRequestException("Sai mật khẩu");
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.uid , role: user.role};
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
