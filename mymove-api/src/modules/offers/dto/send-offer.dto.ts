import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OfferStatus } from '../entities/offer.entity';

export class SendOfferDto {
  @IsString()
  @IsOptional()
  message?: string;
}
