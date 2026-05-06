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
  Request,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { PasswordChangeDto, UserDto } from './dto/user.dto';
import { AccountStatus } from '@prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

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

  @Get('parents/children')
  @Roles('parents')
  async getMyChildren(@Request() req: any) {
    const parentId = req.user.userId;

    if (!parentId) {
      throw new BadRequestException('Invalid user session');
    }

    return this.userService.getChildrenByParent(parentId);
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

  @Get('tag/:class_id')
  getUserDetailToTagInClass(
    @Request() req: any,
    @Param('class_id') class_id: string,
    @Query('search', new DefaultValuePipe("")) filter: string
  ) {
    const uid = req.user.userId
    return this.userService.getUserDetailToTagInClass(uid, class_id, filter)
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

  @Patch('/password')
  async changePassword(
    @Request() req: any, 
    @Body() dto: PasswordChangeDto
  ) {
    const userId = req.user.userId;
    return this.userService.changePassword(userId, dto);
  }

  @Patch(':id/password')
  @Roles('admin')
  async changeUserPassword(
    @Param('id') id: string,
    @Body() dto: PasswordChangeDto
  ) {
    return this.userService.changePassword(id, dto);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avata'))
  updateUser(
    @Param('id') id: string, 
    @Body() dto: Partial<UserDto>,
    @UploadedFile() avata?: Express.Multer.File
  ) {
    return this.userService.updateUser(id, dto, avata);
  }

  @Patch(':id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: AccountStatus,
  ) {
    return this.userService.updateUserStatus(id, status);
  }
}
