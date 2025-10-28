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

@Controller('users')
@UseGuards(AuthGuard('jwt'))
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
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * (MỚI) POST /users
   * Tạo user mới
   */
  @Post()
  createUser(@Body() dto: UserDto) {
    return this.userService.createUser(dto);
  }

  /**
   * PUT /users/:id
   * Cập nhật toàn bộ thông tin user (nên dùng Partial DTO nếu có)
   */
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() dto: UserDto) {
    return this.userService.updateUser(id, dto);
  }

  /**
   * PATCH /users/:id/status
   * Chỉ cập nhật trạng thái
   */
  @Patch(':id/status') 
  updateUserStatus(
    @Param('id') id: string,
    @Body() data: { status: 'active' | 'inactive' } 
  ) {
    return this.userService.updateUser(id, { status: data.status } as UserDto);
  }


}