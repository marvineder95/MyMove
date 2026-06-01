import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MoveRequest } from '@modules/requests/entities/move-request.entity';
import { Company } from '@modules/companies/entities/company.entity';

@Entity('reviews')
@Unique(['moveRequestId', 'userId'])
@Index(['companyId'])
@Index(['userId'])
@Index(['rating'])
export class Review {
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

  @Column({ type: 'int', unsigned: true, name: 'user_id' })
  userId: number;

  @Column({ type: 'int', unsigned: true })
  rating: number;

  @Column({ type: 'text', nullable: true, name: 'review_text' })
  reviewText: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
