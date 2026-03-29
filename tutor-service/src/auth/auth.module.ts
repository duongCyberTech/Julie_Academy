import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { AnalysisModule } from "src/analysis/analysis.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { AuthController } from "./auth.controller";
import { UserService } from "src/user/user.service";
import { StringValue } from 'ms';
require('dotenv').config()

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dsalt@DDD111",
      signOptions: { expiresIn: (process.env.EXPIRATION ?? '2h') as StringValue},
    }),
    UserModule,
    AnalysisModule
  ],
  providers: [AuthService, JwtStrategy, UserService],
  controllers: [AuthController],
})
export class AuthModule {}
