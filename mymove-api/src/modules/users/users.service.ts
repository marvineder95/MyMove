import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcryptjs';
import { User } from './entities/user.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateSettingsDto, UpdatePreferencesDto } from './dto/update-settings.dto';
import { PaginationMeta } from '@common/interfaces/pagination.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findAll(page: number, limit: number): Promise<{ data: User[]; meta: PaginationMeta }> {
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.max(1, Math.min(limit, 100));

    return this.usersRepository.findAll({ page: validatedPage, limit: validatedLimit });
  }

  async findCustomers(page: number, limit: number): Promise<{ data: User[]; meta: PaginationMeta }> {
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.max(1, Math.min(limit, 100));

    return this.usersRepository.findByRole(UserRole.END_CUSTOMER, { page: validatedPage, limit: validatedLimit });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const emailExists = await this.usersRepository.existsByEmail(dto.email);

    if (emailExists) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    const bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    const passwordHash = await hash(dto.password, bcryptRounds);

    const userData: Partial<User> = {
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      role: dto.role ?? undefined,
      locale: dto.locale ?? 'de',
    };

    return this.usersRepository.create(userData);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (dto.email) {
      const emailExists = await this.usersRepository.existsByEmail(dto.email);

      if (emailExists && existingUser.email.toLowerCase() !== dto.email.toLowerCase().trim()) {
        throw new ConflictException(`User with email ${dto.email} already exists`);
      }
    }

    const updateData: Partial<User> = {};

    if (dto.email !== undefined) {
      updateData.email = dto.email.toLowerCase().trim();
    }
    if (dto.firstName !== undefined) {
      updateData.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName;
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone;
    }
    if (dto.role !== undefined) {
      updateData.role = dto.role;
    }
    if (dto.locale !== undefined) {
      updateData.locale = dto.locale;
    }

    return this.usersRepository.update(id, updateData);
  }

  async updateSettings(id: number, dto: UpdateSettingsDto): Promise<User> {
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updateData: Partial<User> = {};

    if (dto.emailNewOffers !== undefined) {
      updateData.emailNewOffers = dto.emailNewOffers;
    }
    if (dto.emailOfferUpdates !== undefined) {
      updateData.emailOfferUpdates = dto.emailOfferUpdates;
    }
    if (dto.emailReminders !== undefined) {
      updateData.emailReminders = dto.emailReminders;
    }

    return this.usersRepository.update(id, updateData);
  }

  async updatePreferences(id: number, dto: UpdatePreferencesDto): Promise<User> {
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updateData: Partial<User> = {};

    if (dto.locale !== undefined) {
      updateData.locale = dto.locale;
    }
    if (dto.preferredMovingDays !== undefined) {
      updateData.preferredMovingDays = dto.preferredMovingDays || null;
    }
    if (dto.preferredServices !== undefined) {
      updateData.preferredServices = dto.preferredServices || null;
    }

    return this.usersRepository.update(id, updateData);
  }

  async softDelete(id: number): Promise<void> {
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.usersRepository.softDelete(id);
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`Current user not found`);
    }

    return user;
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    // Load user with password hash for verification
    const userWithPassword = await this.usersRepository.findByEmailWithPassword(user.email);

    if (!userWithPassword) {
      throw new NotFoundException(`User not found`);
    }

    const isCurrentPasswordValid = await compare(dto.currentPassword, userWithPassword.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    const bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    const newPasswordHash = await hash(dto.newPassword, bcryptRounds);

    await this.usersRepository.update(userId, { passwordHash: newPasswordHash });
  }
}
