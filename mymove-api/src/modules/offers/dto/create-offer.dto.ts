import { IsNumber, IsInt, IsString, IsOptional, IsJSON, IsEnum, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferBreakdown } from '../entities/offer.entity';

export class CreateOfferDto {
  @IsInt()
  @Type(() => Number)
  moveRequestId: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  breakdown?: OfferBreakdown;

  @IsString()
  @IsOptional()
  message?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  teamId?: number;
}

export class UpdateOfferDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  breakdown?: OfferBreakdown;

  @IsString()
  @IsOptional()
  message?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  teamId?: number;
}
