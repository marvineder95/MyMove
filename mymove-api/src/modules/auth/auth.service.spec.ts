import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { CompaniesRepository } from '../companies/companies.repository';
import { UserRole } from '@common/enums/user-role.enum';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersRepo = {
    existsByEmail: jest.fn(),
    create: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    update: jest.fn(),
  };

  const mockCompaniesRepo = {
    create: jest.fn(),
    findBySlug: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_EXPIRATION') return '1d';
      if (key === 'BCRYPT_ROUNDS') return 10;
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepo },
        { provide: CompaniesRepository, useValue: mockCompaniesRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user on valid credentials', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        passwordHash: '$2a$10$hashed',
        firstName: 'Max',
        lastName: 'Mustermann',
        role: UserRole.END_CUSTOMER,
        phone: null,
        locale: 'de',
        timezone: 'Europe/Berlin',
        emailVerifiedAt: null,
        phoneVerifiedAt: null,
        lastLoginAt: null,
        lastLoginIp: null,
        profileImageUrl: null,
        gdprConsentAt: null,
        gdprConsentVersion: '1.0',
        dataRetentionDays: 2555,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockUsersRepo.findByEmailWithPassword.mockResolvedValue(user);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });
  });
});
