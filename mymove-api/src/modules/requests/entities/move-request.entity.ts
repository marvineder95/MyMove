import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { RequestVideo } from './request-video.entity';
import { MoveRequestItem } from './move-request-item.entity';

export enum MoveRequestStatus {
  DRAFT = 'DRAFT',
  VIDEO_UPLOADED = 'VIDEO_UPLOADED',
  AI_PROCESSED = 'AI_PROCESSED',
  READY_FOR_REQUEST = 'READY_FOR_REQUEST',
  SENT_TO_COMPANIES = 'SENT_TO_COMPANIES',
}

export interface MoveExtras {
  assemblyRequired?: boolean;
  boxesNeeded?: boolean;
  noParkingZoneRequired?: boolean;
  isFlexibleDate?: boolean;
  elevatorOrigin?: boolean;
  elevatorDestination?: boolean;
  apartmentSize?: number;
  boxCount?: number;
  additionalInsurance?: boolean;
  materials?: MaterialItem[];
}

export interface MaterialItem {
  id: string;
  quantity: number;
  selected: boolean;
}

@Entity('move_requests')
@Index(['userId'])
@Index(['status'])
@Index(['moveDate'])
export class MoveRequest {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 500, name: 'origin_address' })
  originAddress: string;

  @Column({ type: 'varchar', length: 500, name: 'destination_address' })
  destinationAddress: string;

  @Column({ type: 'date', name: 'move_date' })
  moveDate: Date;

  @Column({ type: 'int', name: 'floors_origin', default: 0 })
  floorsOrigin: number;

  @Column({ type: 'int', name: 'floors_destination', default: 0 })
  floorsDestination: number;

  @Column({ type: 'boolean', default: false })
  elevator: boolean;

  @Column({ type: 'int', name: 'parking_distance', nullable: true })
  parkingDistance: number | null;

  @Column({ type: 'json', nullable: true })
  extras: MoveExtras | null;

  @Column({
    type: 'enum',
    enum: MoveRequestStatus,
    default: MoveRequestStatus.DRAFT,
  })
  status: MoveRequestStatus;

  @Column({ type: 'datetime', name: 'sent_at', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'int', unsigned: true, name: 'selected_company_id', nullable: true })
  selectedCompanyId: number | null;

  @OneToOne(() => RequestVideo, (video) => video.moveRequest, { nullable: true })
  video: RequestVideo | null;

  @OneToMany(() => MoveRequestItem, (item) => item.moveRequest)
  items: MoveRequestItem[];

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
