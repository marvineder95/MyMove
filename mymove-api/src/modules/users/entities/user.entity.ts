import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '@modules/companies/entities/company.entity';
import { UserRole } from '@common/enums/user-role.enum';

@Entity('users')
@Index(['role'])
@Index(['deletedAt'])
export class User {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.END_CUSTOMER,
  })
  role: UserRole;

  @Column({ type: 'datetime', name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'datetime', name: 'phone_verified_at', nullable: true })
  phoneVerifiedAt: Date | null;

  @Column({ type: 'datetime', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'varchar', length: 45, name: 'last_login_ip', nullable: true })
  lastLoginIp: string | null;

  @Column({ type: 'varchar', length: 500, name: 'profile_image_url', nullable: true })
  profileImageUrl: string | null;

  @Column({ type: 'varchar', length: 10, default: 'de' })
  locale: string;

  @Column({ type: 'varchar', length: 50, default: 'Europe/Berlin' })
  timezone: string;

  @Column({ type: 'boolean', name: 'email_new_offers', default: true })
  emailNewOffers: boolean;

  @Column({ type: 'boolean', name: 'email_offer_updates', default: true })
  emailOfferUpdates: boolean;

  @Column({ type: 'boolean', name: 'email_reminders', default: true })
  emailReminders: boolean;

  @Column({ type: 'varchar', length: 255, name: 'preferred_moving_days', nullable: true })
  preferredMovingDays: string | null;

  @Column({ type: 'varchar', length: 500, name: 'preferred_services', nullable: true })
  preferredServices: string | null;

  @Column({ type: 'datetime', name: 'gdpr_consent_at', nullable: true })
  gdprConsentAt: Date | null;

  @Column({ type: 'varchar', length: 20, name: 'gdpr_consent_version', default: '1.0' })
  gdprConsentVersion: string;

  @Column({ type: 'int', unsigned: true, name: 'data_retention_days', default: 2555 })
  dataRetentionDays: number;

  @OneToOne(() => Company, (company) => company.owner, { nullable: true })
  company: Company | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
