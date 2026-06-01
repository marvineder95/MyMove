import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '@modules/companies/entities/company.entity';
import { TeamAvailability } from './team-availability.entity';
import { TeamBooking } from './team-booking.entity';

@Entity('company_teams')
@Index(['companyId'])
export class Team {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'max_parallel_jobs',
    default: 1,
  })
  maxParallelJobs: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => TeamAvailability, (availability) => availability.team, {
    cascade: true,
  })
  availabilities: TeamAvailability[];

  @OneToMany(() => TeamBooking, (booking) => booking.team)
  bookings: TeamBooking[];

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
