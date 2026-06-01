import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MoveRequest } from '@modules/requests/entities/move-request.entity';
import { Company } from '@modules/companies/entities/company.entity';

export enum OfferStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface OfferBreakdown {
  baseFee: number;
  laborCost: number;
  distanceCost: number;
  extrasCost: number;
  total: number;
}

@Entity('offers')
@Index(['moveRequestId'])
@Index(['companyId'])
@Index(['status'])
export class Offer {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'move_request_id' })
  moveRequestId: number;

  @ManyToOne(() => MoveRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'move_request_id' })
  moveRequest: MoveRequest;

  @Column({ type: 'int', unsigned: true, name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.DRAFT,
  })
  status: OfferStatus;

  @Column({ type: 'json', nullable: true })
  breakdown: OfferBreakdown | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'int', unsigned: true, name: 'team_id', nullable: true })
  teamId: number | null;

  @Column({ type: 'datetime', name: 'sent_at', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'datetime', name: 'accepted_at', nullable: true })
  acceptedAt: Date | null;

  @Column({ type: 'datetime', name: 'rejected_at', nullable: true })
  rejectedAt: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
