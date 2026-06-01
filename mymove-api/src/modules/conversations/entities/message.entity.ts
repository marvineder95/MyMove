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
import { Conversation } from './conversation.entity';
import { MessageFile } from './message-file.entity';

export enum SenderType {
  CUSTOMER = 'CUSTOMER',
  COMPANY = 'COMPANY',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
}

export enum MessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
  FILE = 'FILE',
}

@Entity('messages')
@Index(['conversationId'])
@Index(['createdAt'])
export class Message {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'conversation_id' })
  conversationId: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({
    type: 'enum',
    enum: SenderType,
    name: 'sender_type',
  })
  senderType: SenderType;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'sender_id' })
  senderId: number | null;

  @Column({
    type: 'enum',
    enum: MessageType,
    name: 'message_type',
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;

  @OneToMany(() => MessageFile, (file) => file.message, { cascade: true })
  files: MessageFile[];

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
