import { IsString, IsInt } from 'class-validator';

export class ConfirmFileUploadDto {
  @IsString()
  s3Key: string;

  @IsString()
  fileType: string;

  @IsString()
  fileName: string;

  @IsInt()
  fileSize: number;
}
