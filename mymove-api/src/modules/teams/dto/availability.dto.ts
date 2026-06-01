import { IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class SetAvailabilityDto {
  @IsDateString()
  date: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean = true;
}
