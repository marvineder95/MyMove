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
import { MoveRequest } from '@modules/requests/entities/move-request.entity';

export enum BookingStatus {
  RESERVED = 'RESERVED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('team_bookings')
@Index(['teamId'])
@Index(['moveRequestId'])
@Index(['bookingDate'])
export class TeamBooking {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'team_id' })
  teamId: number;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ type: 'int', unsigned: true, name: 'move_request_id' })
  moveRequestId: number;

  @ManyToOne(() => MoveRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'move_request_id' })
  moveRequest: MoveRequest;

  @Column({ type: 'date', name: 'booking_date' })
  bookingDate: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.RESERVED,
  })
  status: BookingStatus;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
