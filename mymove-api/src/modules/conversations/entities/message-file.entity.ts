import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('message_files')
export class MessageFile {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'message_id' })
  messageId: number;

  @ManyToOne(() => Message, (message) => message.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ type: 'varchar', length: 500, name: 'file_url' })
  fileUrl: string;

  @Column({ type: 'varchar', length: 100, name: 'file_type' })
  fileType: string;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName: string;

  @Column({ type: 'int', unsigned: true, name: 'file_size' })
  fileSize: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
