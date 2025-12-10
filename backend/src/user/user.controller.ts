import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Put,
  Patch,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { AccountStatus } from '@prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /users
   * Lấy danh sách user (đã hỗ trợ phân trang và filter)
   */
  @Get()
  getAllUsers(
    @Query('role') role: string,
    @Query('status') status: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter: string = '',
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    return this.userService.findAll(role, status, pageNum, limitNum, filter);
  }

  /**
   * GET /users/e
   * Lấy user theo email
   */
  @Get('e')
  async getUserByEmail(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * GET /users/:id
   * Lấy user theo ID
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    console.log(`Find data of user ${id}`)
    const user = await this.userService.findById(id);
    console.log(`Find user ${id}: `, user)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * POST /users
   * Tạo user mới
   */
  @Post()
  createUser(@Body() dto: UserDto) {
    return this.userService.createUser(dto);
  }

  /**
   * PATCH /users/:id
   * Cập nhật thông tin user
   */
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() dto: Partial<UserDto>) {
    return this.userService.updateUser(id, dto);
  }

  @Patch(':id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: AccountStatus,
  ) {
    return this.userService.updateUserStatus(id, status);
  }
}
