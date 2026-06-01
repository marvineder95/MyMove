import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';

export enum DocumentType {
  TRADE_LICENSE = 'TRADE_LICENSE',
  INSURANCE = 'INSURANCE',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@Entity('company_documents')
@Index(['companyId'])
@Index(['status'])
@Index(['deletedAt'])
export class CompanyDocument {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
    name: 'document_type',
  })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName: string;

  @Column({ type: 'varchar', length: 500, name: 'file_url' })
  fileUrl: string;

  @Column({ type: 'varchar', length: 50, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'int', unsigned: true, name: 'file_size_bytes' })
  fileSizeBytes: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ type: 'int', unsigned: true, name: 'verified_by', nullable: true })
  verifiedBy: number | null;

  @Column({ type: 'datetime', name: 'verified_at', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
