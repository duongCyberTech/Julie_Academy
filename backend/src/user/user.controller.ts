import { Controller, Get, Post, Body, Query, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import {UserDto} from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Get()
  @UseGuards(AuthGuard('jwt'))
  getAllUsers(
    @Query('role') role: string,
    @Query('status') status: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter: string = '',
  ){
    return this.userService.findAll(role, status, page, limit, filter);
  }

  @Get('e')
  @UseGuards(AuthGuard('jwt'))
  getUserByEmail(@Query('email') email: string){
    if (!email) return {status: 400, message: 'Email query is required'};
    return this.userService.findByEmail(email);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  updateUser(@Param('id') id: string, @Body() dto: UserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  disableAccount(@Param('id') id: string) {
    return this.userService.updateUser(id, {status: 'inactive'} as UserDto);
  }
}
