import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class InitiateVideoUploadDto {
  @IsString()
  @IsOptional()
  contentType?: string = 'video/mp4';

  @IsInt()
  @Min(1)
  @Max(524288000) // 500MB max
  @IsOptional()
  fileSizeBytes?: number;
}
