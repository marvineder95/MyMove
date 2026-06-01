import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { PaginationMeta, PaginationParams } from '@common/interfaces/pagination.interface';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const user = await this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.role',
        'user.emailVerifiedAt',
        'user.phoneVerifiedAt',
        'user.lastLoginAt',
        'user.lastLoginIp',
        'user.profileImageUrl',
        'user.locale',
        'user.timezone',
        'user.gdprConsentAt',
        'user.gdprConsentVersion',
        'user.dataRetentionDays',
        'user.emailNewOffers',
        'user.emailOfferUpdates',
        'user.emailReminders',
        'user.preferredMovingDays',
        'user.preferredServices',
        'user.createdAt',
        'user.updatedAt',
        'user.deletedAt',
        'company.id',
        'company.companyName',
        'company.slug',
      ])
      .where('user.id = :id', { id })
      .getOne();

    return user ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.role',
        'user.emailVerifiedAt',
        'user.phoneVerifiedAt',
        'user.lastLoginAt',
        'user.lastLoginIp',
        'user.profileImageUrl',
        'user.locale',
        'user.timezone',
        'user.gdprConsentAt',
        'user.gdprConsentVersion',
        'user.dataRetentionDays',
        'user.emailNewOffers',
        'user.emailOfferUpdates',
        'user.emailReminders',
        'user.preferredMovingDays',
        'user.preferredServices',
        'user.createdAt',
        'user.updatedAt',
        'user.deletedAt',
        'company.id',
        'company.companyName',
        'company.slug',
      ])
      .where('user.email = :email', { email: email.toLowerCase().trim() })
      .getOne();

    return user ?? null;
  }

  async findAll(params: PaginationParams): Promise<{ data: User[]; meta: PaginationMeta }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.role',
        'user.emailVerifiedAt',
        'user.phoneVerifiedAt',
        'user.lastLoginAt',
        'user.lastLoginIp',
        'user.profileImageUrl',
        'user.locale',
        'user.timezone',
        'user.gdprConsentAt',
        'user.gdprConsentVersion',
        'user.dataRetentionDays',
        'user.emailNewOffers',
        'user.emailOfferUpdates',
        'user.emailReminders',
        'user.preferredMovingDays',
        'user.preferredServices',
        'user.createdAt',
        'user.updatedAt',
        'user.deletedAt',
        'company.id',
        'company.companyName',
        'company.slug',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { data, meta };
  }

  async create(data: Partial<User>): Promise<User> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    await this.repository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`User with id ${id} not found after update`);
    }
    return updated;
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email.toLowerCase().trim() })
      .getCount();

    return count > 0;
  }

  async findByRole(role: UserRole, params: PaginationParams): Promise<{ data: User[]; meta: PaginationMeta }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.role',
        'user.emailVerifiedAt',
        'user.phoneVerifiedAt',
        'user.lastLoginAt',
        'user.lastLoginIp',
        'user.profileImageUrl',
        'user.locale',
        'user.timezone',
        'user.gdprConsentAt',
        'user.gdprConsentVersion',
        'user.dataRetentionDays',
        'user.emailNewOffers',
        'user.emailOfferUpdates',
        'user.emailReminders',
        'user.preferredMovingDays',
        'user.preferredServices',
        'user.createdAt',
        'user.updatedAt',
        'user.deletedAt',
        'company.id',
        'company.companyName',
        'company.slug',
      ])
      .where('user.role = :role', { role })
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { data, meta };
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { email: email.toLowerCase().trim() },
      withDeleted: false,
    });

    return user ?? null;
  }
}
