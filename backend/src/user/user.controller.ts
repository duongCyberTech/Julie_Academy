import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import {UserDto} from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUserByEmail(@Query('email') email: string){
    if (!email) return this.userService.findAll();
    return this.userService.findByEmail(email);
  }

  @Post()
  async createUser(@Body() dto: UserDto) {
    const newUser = await this.userService.createUser(dto)
    return newUser;
  }

}
