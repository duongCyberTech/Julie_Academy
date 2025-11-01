import { Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    console.log("Find user: ", user)
    const isMatched = await bcrypt.compare(pass, user?.password)
    if (user && isMatched) {
      const { password, ...result } = user;
      console.log(user)
      return result;
    }
    return null;
  }

  async login(user: any) {
    console.log('User object before creating payload:', user);
    const payload = { email: user.email, sub: user.uid , role: user.role};
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
