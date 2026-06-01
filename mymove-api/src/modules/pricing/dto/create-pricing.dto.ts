import {
  IsNumber,
  IsInt,
  IsOptional,
  IsJSON,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ServicePricesDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  assembly?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  boxes?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  noParkingZone?: number;
}

export class CreatePricingDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  baseFee: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerHour: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerKm: number;

  @IsInt()
  @Min(1)
  @Max(24)
  @Type(() => Number)
  minimumHours: number;

  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  teamSize: number;

  @ValidateNested()
  @Type(() => ServicePricesDto)
  @IsOptional()
  servicePrices?: ServicePricesDto;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  pricePerWorker?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  additionalWorkerPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  travelFee?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  boxRentalPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  wardrobeBoxPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  stretchFilmPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  tapePrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  mattressCoverPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  furnitureBlanketPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  packingServiceHourlyRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  noParkingZonePrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  storagePricePerSqm?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  disposalServicePrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  weekendSurcharge?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  holidaySurcharge?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  eveningSurcharge?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  urgentBookingSurcharge?: number;
}
