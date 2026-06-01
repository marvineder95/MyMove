import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MoveRequest } from './move-request.entity';

@Entity('request_videos')
export class RequestVideo {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'move_request_id', unique: true })
  moveRequestId: number;

  @OneToOne(() => MoveRequest, (moveRequest) => moveRequest.video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'move_request_id' })
  moveRequest: MoveRequest;

  @Column({ type: 'varchar', length: 500, name: 's3_key' })
  s3Key: string;

  @Column({ type: 'varchar', length: 500, name: 's3_url', nullable: true })
  s3Url: string | null;

  @Column({ type: 'varchar', length: 50, name: 'content_type', default: 'video/mp4' })
  contentType: string;

  @Column({ type: 'int', unsigned: true, name: 'file_size_bytes', nullable: true })
  fileSizeBytes: number | null;

  @Column({ type: 'datetime', name: 'uploaded_at' })
  uploadedAt: Date;

  @Column({ type: 'datetime', name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
