import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { AuthController } from "./auth.controller";
import { UserService } from "src/user/user.service";
<<<<<<< HEAD
=======
require('dotenv').config()
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268

@Module({
  imports: [
    JwtModule.register({
<<<<<<< HEAD
      secret: process.env.JWT_SECRET,
=======
      secret: process.env.JWT_SECRET || "dsalt@DDD111",
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
      signOptions: { expiresIn: '2h' },
    }),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy, UserService],
  controllers: [AuthController],
})
export class AuthModule {}
