import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@common/enums/user-role.enum';
import { User } from '@modules/users/entities/user.entity';
import { UsersRepository } from '@modules/users/users.repository';
import { Company, CompanyStatus } from '@modules/companies/entities/company.entity';
import { CompaniesRepository } from '@modules/companies/companies.repository';
import { RegisterCustomerDto, RegisterCompanyDto, LoginDto, DevLoginDto } from './dto/register.dto';

interface JwtTokenPayload {
  sub: number;
  email: string;
  role: UserRole;
  companyId?: number;
}

interface LoginResponse {
  accessToken: string;
  user: Omit<User, 'passwordHash'>;
}

interface RegisterCompanyResponse {
  user: Omit<User, 'passwordHash'>;
  company: Company;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  /**
   * Register a new end-customer account.
   */
  async registerCustomer(dto: RegisterCustomerDto): Promise<Omit<User, 'passwordHash'>> {
    const emailExists = await this.usersRepository.existsByEmail(dto.email);

    if (emailExists) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.usersRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      role: UserRole.END_CUSTOMER,
      locale: dto.locale ?? 'de',
    });

    return this.omitPasswordHash(user);
  }

  /**
   * Register a new company account.
   * Creates both a user (role=COMPANY) and a company entity.
   */
  async registerCompany(dto: RegisterCompanyDto): Promise<RegisterCompanyResponse> {
    const emailExists = await this.usersRepository.existsByEmail(dto.email);

    if (emailExists) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const slug = await this.generateUniqueSlug(dto.companyName);

    const user = await this.usersRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      role: UserRole.COMPANY,
      locale: dto.locale ?? 'de',
    });

    const company = await this.companiesRepository.create({
      userId: user.id,
      companyName: dto.companyName,
      slug,
      description: dto.description ?? null,
      website: dto.website ?? null,
      phone: dto.phone ?? null,
      email: dto.email.toLowerCase().trim(),
      taxId: dto.taxId ?? null,
      status: CompanyStatus.PENDING,
    });

    return {
      user: this.omitPasswordHash(user),
      company,
    };
  }

  /**
   * Authenticate a user and issue a local JWT access token.
   */
  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersRepository.findByEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // For company users, include companyId in JWT
    if (user.role === UserRole.COMPANY) {
      const company = await this.companiesRepository.findByUserId(user.id);
      if (company) {
        payload.companyId = company.id;
      }
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '1d'),
    });

    await this.usersRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      user: this.omitPasswordHash(user),
    };
  }

  /**
   * Development login — finds or creates a test account for the given role
   * and returns a JWT access token. Only available in non-production environments.
   */
  async devLogin(dto: DevLoginDto): Promise<LoginResponse> {
    const devAccounts: Record<string, { email: string; password: string; firstName: string; lastName: string; role: UserRole }> = {
      admin: {
        email: 'admin@point4studio.de',
        password: 'Admin1234!',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      },
      company: {
        email: 'company@mymove.de',
        password: 'Company1234!',
        firstName: 'Max',
        lastName: 'Mustermann',
        role: UserRole.COMPANY,
      },
      end_customer: {
        email: 'endcustomer@mymove.de',
        password: 'Customer1234!',
        firstName: 'Anna',
        lastName: 'Schmidt',
        role: UserRole.END_CUSTOMER,
      },
    };

    const account = devAccounts[dto.role];

    if (!account) {
      throw new UnauthorizedException('Invalid dev role');
    }

    let user = await this.usersRepository.findByEmail(account.email);

    if (!user) {
      const passwordHash = await this.hashPassword(account.password);
      user = await this.usersRepository.create({
        email: account.email,
        passwordHash,
        firstName: account.firstName,
        lastName: account.lastName,
        phone: null,
        role: account.role,
        locale: 'de',
      });

      // Create a minimal company record for COMPANY users
      if (account.role === UserRole.COMPANY) {
        const slug = await this.generateUniqueSlug('dev-moving-company');
        await this.companiesRepository.create({
          userId: user.id,
          companyName: 'Dev Moving Company',
          slug,
          description: 'Development test company',
          website: null,
          phone: null,
          email: account.email,
          taxId: null,
          status: CompanyStatus.APPROVED,
        });
      }
    }

    const payload: JwtTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // For company users, include companyId in JWT
    if (user.role === UserRole.COMPANY) {
      const company = await this.companiesRepository.findByUserId(user.id);
      if (company) {
        payload.companyId = company.id;
      }
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '1d'),
    });

    await this.usersRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      user: this.omitPasswordHash(user),
    };
  }

  /**
   * Retrieve the current authenticated user by ID.
   */
  async getMe(userId: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.omitPasswordHash(user);
  }

  /**
   * Hash a plain-text password using bcrypt.
   */
  private async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    return bcrypt.hash(password, rounds);
  }

  /**
   * Generate a URL-friendly, unique slug from a company name.
   */
  private async generateUniqueSlug(companyName: string): Promise<string> {
    const base = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = base;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const suffix = attempts === 0 ? '' : `-${Date.now().toString(36)}`;
      const candidate = `${base}${suffix}`;
      const existing = await this.companiesRepository.findBySlug(candidate);

      if (!existing) {
        slug = candidate;
        break;
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      slug = `${base}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    }

    return slug;
  }

  /**
   * Strip the passwordHash field from a User entity before returning it.
   */
  private omitPasswordHash(user: User): Omit<User, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }
}
