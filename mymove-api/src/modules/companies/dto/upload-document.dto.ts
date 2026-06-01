import { IsEnum, IsString, IsUrl, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@modules/companies/entities/company-document.entity';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Type of document', enum: DocumentType, example: DocumentType.TRADE_LICENSE })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ description: 'Original file name', example: 'trade-license-2024.pdf' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'Public URL to the uploaded file', example: 'https://storage.mymove.de/docs/trade-license-2024.pdf' })
  @IsString()
  @IsUrl()
  fileUrl: string;

  @ApiProperty({ description: 'MIME type of the file', example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes', example: 1048576 })
  @IsInt()
  @Min(1)
  fileSizeBytes: number;
}
