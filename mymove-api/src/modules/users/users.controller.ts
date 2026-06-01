import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@common/enums/user-role.enum';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateSettingsDto, UpdatePreferencesDto } from './dto/update-settings.dto';
import { User } from './entities/user.entity';
import { PaginationMeta } from '@common/interfaces/pagination.interface';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
}

interface PaginatedUsersResponse {
  data: User[];
  meta: PaginationMeta;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getMe(@CurrentUser() authUser: AuthUser): Promise<User> {
    const userId = Number(authUser.userId);
    return this.usersService.getCurrentUser(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current authenticated user' })
  async updateMe(
    @CurrentUser() authUser: AuthUser,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    const userId = Number(authUser.userId);
    return this.usersService.update(userId, dto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change current user password' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() authUser: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    const userId = Number(authUser.userId);
    return this.usersService.changePassword(userId, dto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (ADMIN only)' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findById(id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users with pagination (ADMIN only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedUsersResponse> {
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;
    return this.usersService.findAll(pageNum, limitNum);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update any user by ID (ADMIN only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Get('me/settings')
  @ApiOperation({ summary: 'Get current user settings and preferences' })
  async getSettings(@CurrentUser() authUser: AuthUser): Promise<User> {
    const userId = Number(authUser.userId);
    return this.usersService.getCurrentUser(userId);
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update current user notification settings' })
  async updateSettings(
    @CurrentUser() authUser: AuthUser,
    @Body() dto: UpdateSettingsDto,
  ): Promise<User> {
    const userId = Number(authUser.userId);
    return this.usersService.updateSettings(userId, dto);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  async updatePreferences(
    @CurrentUser() authUser: AuthUser,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<User> {
    const userId = Number(authUser.userId);
    return this.usersService.updatePreferences(userId, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Soft delete current authenticated user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser() authUser: AuthUser): Promise<void> {
    const userId = Number(authUser.userId);
    return this.usersService.softDelete(userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a user by ID (ADMIN only)' })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.softDelete(id);
  }

  @Get('admin/customers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all customers (END_CUSTOMER) with pagination (ADMIN only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedUsersResponse> {
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;
    return this.usersService.findCustomers(pageNum, limitNum);
  }
}
