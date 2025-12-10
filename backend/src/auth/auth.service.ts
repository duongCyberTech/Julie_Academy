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
<<<<<<< HEAD
    console.log("Find user: ", user)
    const isMatched = await bcrypt.compare(pass, user?.password)
    if (user && isMatched) {
      const { password, ...result } = user;
      console.log(user)
=======
    const isMatched = await bcrypt.compare(pass, user?.password)
    if (user && isMatched) {
      const { password, ...result } = user;
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
      return result;
    }
    return null;
  }

  async login(user: any) {
<<<<<<< HEAD
    console.log('User object before creating payload:', user);
=======
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
    const payload = { email: user.email, sub: user.uid , role: user.role};
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
