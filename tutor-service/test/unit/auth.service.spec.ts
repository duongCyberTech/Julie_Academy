import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Mock thư viện bcrypt
jest.mock('bcrypt');

describe('AuthService > login', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  // Giả lập UserService
  const mockUserService = { findByEmail: jest.fn() }

  // Giả lập JwtService
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('nên trả về accessToken khi login thành công', async () => {
      // 1. Arrange: Chuẩn bị dữ liệu đầu vào và kết quả mong muốn
      const user = {
        email: 'julie@hcmut.edu.vn',
        uid: 'user-123',
        role: 'ADMIN',
      };
      const expectedToken = 'mock-jwt-token';
      
      // Giả lập hàm sign của JwtService trả về token
      mockJwtService.sign.mockReturnValue(expectedToken);

      // 2. Act: Gọi hàm login
      const result = await service.login(user);

      // 3. Assert: Kiểm tra kết quả
      expect(result).toEqual({
        accessToken: expectedToken,
      });

      // Quan trọng: Kiểm tra xem Payload truyền vào JwtService có đúng không
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.uid,
        role: user.role,
      });
    });
  });
});

describe('AuthService › validateUser', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('nên trả về user (không kèm password) khi email và pass đều đúng', async () => {
    // Arrange
    const mockUser = {
      uid: '123',
      email: 'julie@hcmut.edu.vn',
      password: 'hashed_password',
      name: 'Julie',
    };
    mockUserService.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Act
    const result = await service.validateUser('julie@hcmut.edu.vn', 'plain_pass');

    // Assert
    expect(result).not.toHaveProperty('password'); // Đảm bảo đã lọc password
    expect(result?.email).toBe(mockUser.email);
    expect(bcrypt.compare).toHaveBeenCalledWith('plain_pass', 'hashed_password');
  });

  it('nên trả về null nếu không tìm thấy user qua email', async () => {
    // Arrange
    mockUserService.findByEmail.mockResolvedValue(null);

    // Act
    const result = await service.validateUser('wrong@email.com', 'any_pass');

    // Assert
    expect(result).toBeNull();
    expect(bcrypt.compare).not.toHaveBeenCalled(); // Không tìm thấy user thì không cần so khớp pass
  });

  it('nên trả về null nếu mật khẩu không khớp', async () => {
    // Arrange
    mockUserService.findByEmail.mockResolvedValue({ email: 'a@b.com', password: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act
    const result = await service.validateUser('a@b.com', 'wrong_pass');

    // Assert
    expect(result).toBeNull();
  });
});