import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Patch,
  UseGuards,
  NotFoundException,
  BadRequestException,
  UseInterceptors, // Thêm
  UploadedFile,    // Thêm
  Request,       //Thêm
  Req            // Thêm
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express'; // Thêm để xử lý file
import { diskStorage } from 'multer'; // Thêm cấu hình lưu trữ
import { extname } from 'path'; // Thêm để lấy đuôi file
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
  @Get('parents/children')
  @Roles('parents')
  async getMyChildren(@Request() req) {
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

  /**
   * GET /users/:id
   * Lấy user theo ID
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    console.log(`Find data of user ${id}`);
    const user = await this.userService.findById(id);
    console.log(`Find user ${id}: `, user);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // --- THÊM API UPLOAD AVATAR MỚI ---
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', // Lưu file vào thư mục 'uploads' ở root dự án
      filename: (req, file, callback) => {
        // Tạo tên file ngẫu nhiên để tránh trùng
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      // Chỉ cho phép ảnh
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    if (!file) {
      throw new BadRequestException('File is not provided');
    }

    // Tạo đường dẫn URL để truy cập ảnh
    // Ví dụ: http://localhost:3000/uploads/filename.jpg
    const protocol = req.protocol;
    const host = req.get('host');
    const avatarUrl = `${protocol}://${host}/uploads/${file.filename}`;

    // Cập nhật URL vào Database
    return this.userService.updateUser(id, { avata_url: avatarUrl });
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
