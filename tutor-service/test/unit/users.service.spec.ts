import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service'; // Sử dụng Alias Path
import { PrismaService } from 'src/prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, User } from '@prisma/client';
import { CloudinaryService } from 'src/resource/cloudinary/cloudinary.service';

describe('UserService', () => {
  let service: UserService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService, 
        {
          provide: PrismaService,
          useValue: prismaMock, 
        },
        // 2. MOCK THÊM CloudinaryService VÀO ĐÂY
        {
          provide: CloudinaryService,
          useValue: {
            // Cung cấp các hàm giả mạo mà UserService có thể sẽ gọi.
            // Ví dụ, nếu UserService gọi cloudinaryService.upload(), bạn mock nó bằng jest.fn()
            uploadImage: jest.fn().mockResolvedValue({ url: 'http://fake-url.com/image.png' }),
            deleteImage: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findById', () => {
    it('nên trả về thông tin user chi tiết khi tìm thấy uid hợp lệ', async () => {
      // 1. Arrange: Định nghĩa dữ liệu giả khớp với cấu trúc "select"
      const mockUserResponse = {
        uid: 'user-123',
        username: 'julie_hcmut',
        email: 'julie@hcmut.edu.vn',
        fname: 'Julie',
        mname: 'The',
        lname: 'Dev',
        role: 'STUDENT',
        status: 'ACTIVE',
        avata_url: 'https://avatar.com/julie.png',
        student: { id: 'std-1' }, // Giả lập quan hệ student
        tutor: null,
        parents: [],
      };

      // Giả lập hàm findUnique trả về mockUserResponse
      prismaMock.user.findUnique.mockResolvedValue(mockUserResponse as any);

      // 2. Act: Gọi hàm
      const result = await service.findById('user-123');

      // 3. Assert: Kiểm tra
      expect(result).toEqual(mockUserResponse);
      
      // Kiểm tra xem Prisma có được gọi với đúng tham số "where" và "select" không
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { uid: 'user-123' },
        select: expect.objectContaining({
          uid: true,
          username: true,
          student: true,
        }),
      });
    });

    it('nên trả về null nếu không tìm thấy người dùng', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });
});

function uuid(): string {
    throw new Error('Function not implemented.');
}
