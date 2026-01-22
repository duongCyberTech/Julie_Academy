import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { AuthController } from "./auth.controller";
import { UserService } from "src/user/user.service";
require('dotenv').config()

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dsalt@DDD111",
      signOptions: { expiresIn: '2h' },
    }),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy, UserService],
  controllers: [AuthController],
})
export class AuthModule {}
