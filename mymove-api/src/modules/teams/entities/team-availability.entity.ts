import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from './team.entity';

@Entity('team_availability')
@Index(['teamId'])
@Index(['date'])
export class TeamAvailability {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'team_id' })
  teamId: number;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'boolean', name: 'is_available', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
