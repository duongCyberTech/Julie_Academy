import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard) // Guard được áp dụng ở đây
  @Get('profile')
  getProfile(@Request() req) {
    // Nếu token hợp lệ, `req.user` sẽ chứa giá trị trả về từ `validate` method trong JwtStrategy
    return req.user; 
  }
}
