import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { CompanyDocument } from './company-document.entity';

export enum CompanyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

@Entity('companies')
@Index(['status'])
@Index(['deletedAt'])
export class Company {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'user_id' })
  userId: number;

  @OneToOne(() => User, (user) => user.company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  owner: User;

  @Column({ type: 'varchar', length: 200, name: 'company_name' })
  companyName: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, name: 'tax_id', nullable: true })
  taxId: string | null;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.PENDING,
  })
  status: CompanyStatus;

  @Column({ type: 'datetime', name: 'approved_at', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'int', unsigned: true, name: 'approved_by', nullable: true })
  approvedBy: number | null;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'text', name: 'banner_url', nullable: true })
  bannerUrl: string | null;

  @Column({ type: 'int', unsigned: true, name: 'founding_year', nullable: true })
  foundingYear: number | null;

  @Column({ type: 'int', unsigned: true, name: 'employee_count', nullable: true })
  employeeCount: number | null;

  @Column({ type: 'varchar', length: 200, name: 'contact_person', nullable: true })
  contactPerson: string | null;

  @Column({ type: 'varchar', length: 255, name: 'support_email', nullable: true })
  supportEmail: string | null;

  @Column({ type: 'text', name: 'services_json', nullable: true })
  servicesJson: string | null;

  @Column({ type: 'varchar', length: 255, name: 'main_location', nullable: true })
  mainLocation: string | null;

  @Column({ type: 'int', unsigned: true, name: 'operating_radius_km', nullable: true })
  operatingRadiusKm: number | null;

  @Column({ type: 'text', name: 'supported_cities_json', nullable: true })
  supportedCitiesJson: string | null;

  @Column({ type: 'boolean', name: 'international_moves', default: false })
  internationalMoves: boolean;

  @Column({ type: 'int', unsigned: true, name: 'max_parallel_jobs', nullable: true })
  maxParallelJobs: number | null;

  @Column({ type: 'int', unsigned: true, name: 'avg_response_time_hours', nullable: true })
  avgResponseTimeHours: number | null;

  @Column({ type: 'int', unsigned: true, name: 'completed_moves_count', default: 0 })
  completedMovesCount: number;

  @Column({ type: 'varchar', length: 255, name: 'service_area_json', nullable: true })
  serviceAreaJson: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'average_rating', nullable: true })
  averageRating: number | null;

  @Column({ type: 'int', unsigned: true, name: 'total_reviews', default: 0 })
  totalReviews: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'commission_rate', default: 0.12 })
  commissionRate: number;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  isVerified: boolean;

  @OneToMany(() => CompanyDocument, (document) => document.company, { cascade: true })
  documents: CompanyDocument[];

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
