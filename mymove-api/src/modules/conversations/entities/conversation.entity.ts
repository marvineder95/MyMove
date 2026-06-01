import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { MoveRequest } from '@modules/requests/entities/move-request.entity';
import { User } from '@modules/users/entities/user.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index(['moveRequestId'])
@Index(['customerId'])
@Index(['companyId'])
@Index(['lastMessageAt'])
export class Conversation {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'move_request_id' })
  moveRequestId: number;

  @ManyToOne(() => MoveRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'move_request_id' })
  moveRequest: MoveRequest;

  @Column({ type: 'int', unsigned: true, name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ type: 'int', unsigned: true, name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'datetime', nullable: true, name: 'last_message_at' })
  lastMessageAt: Date | null;

  @OneToMany(() => Message, (message) => message.conversation, { cascade: true })
  messages: Message[];

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
