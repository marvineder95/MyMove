import { IsString, IsInt, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsString()
  fileType: string;

  @IsString()
  fileName: string;

  @IsInt()
  @IsOptional()
  fileSize?: number;
}
