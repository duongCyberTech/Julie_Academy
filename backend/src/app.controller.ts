import { Controller, Get, UseGuards, Request, Inject, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { ClientKafka } from '@nestjs/microservices';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    private readonly appService: AppService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    this.kafkaClient.connect()
  }

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
