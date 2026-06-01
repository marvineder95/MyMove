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
import { MoveRequest } from './move-request.entity';

@Entity('move_request_items')
@Index(['moveRequestId'])
@Index(['isAiDetected'])
export class MoveRequestItem {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'move_request_id' })
  moveRequestId: number;

  @ManyToOne(() => MoveRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'move_request_id' })
  moveRequest: MoveRequest;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'int', unsigned: true, default: 1 })
  quantity: number;

  @Column({ type: 'float', nullable: true })
  volume: number | null;

  @Column({ type: 'float', nullable: true })
  weight: number | null;

  @Column({ type: 'boolean', name: 'is_ai_detected', default: false })
  isAiDetected: boolean;

  @Column({ type: 'float', name: 'confidence_score', nullable: true })
  confidenceScore: number | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
