import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  Length,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemDto {
  @IsString()
  @MinLength(1)
  @Length(1, 200)
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @Max(999)
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  volume?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @IsBoolean()
  @IsOptional()
  isAiDetected?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  confidenceScore?: number;
}
