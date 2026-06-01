import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterCustomerDto, RegisterCompanyDto, LoginDto, DevLoginDto } from './dto/register.dto';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { User } from '@modules/users/entities/user.entity';
import { Company } from '@modules/companies/entities/company.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new end-customer account' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async registerCustomer(@Body() dto: RegisterCustomerDto): Promise<Omit<User, 'passwordHash'>> {
    return this.authService.registerCustomer(dto);
  }

  @Public()
  @Post('register-company')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new company account' })
  @ApiResponse({ status: 201, description: 'Company account created successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async registerCompany(
    @Body() dto: RegisterCompanyDto,
  ): Promise<{ user: Omit<User, 'passwordHash'>; company: Company }> {
    return this.authService.registerCompany(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
  ): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Development login — auto-creates test accounts' })
  @ApiResponse({ status: 200, description: 'Dev login successful' })
  @ApiResponse({ status: 401, description: 'Invalid role' })
  async devLogin(
    @Body() dto: DevLoginDto,
  ): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
    return this.authService.devLogin(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(
    @CurrentUser('userId') userId: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    const id = Number(userId);

    if (Number.isNaN(id)) {
      throw new UnauthorizedException('Invalid user ID');
    }

    return this.authService.getMe(id);
  }
}
