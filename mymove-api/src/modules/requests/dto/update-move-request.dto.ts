import {
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  Max,
  Length,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class MoveExtrasDto {
  @IsBoolean()
  @IsOptional()
  assemblyRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  boxesNeeded?: boolean;

  @IsBoolean()
  @IsOptional()
  noParkingZoneRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  isFlexibleDate?: boolean;

  @IsBoolean()
  @IsOptional()
  elevatorOrigin?: boolean;

  @IsBoolean()
  @IsOptional()
  elevatorDestination?: boolean;

  @IsInt()
  @Min(10)
  @Max(500)
  @IsOptional()
  apartmentSize?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  boxCount?: number;

  @IsBoolean()
  @IsOptional()
  additionalInsurance?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialItemDto)
  @IsOptional()
  materials?: MaterialItemDto[];
}

class MaterialItemDto {
  @IsString()
  id: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsBoolean()
  selected: boolean;
}

export class UpdateMoveRequestDto {
  @IsString()
  @Length(5, 500)
  @IsOptional()
  originAddress?: string;

  @IsString()
  @Length(5, 500)
  @IsOptional()
  destinationAddress?: string;

  @IsDateString()
  @IsOptional()
  moveDate?: string;

  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  floorsOrigin?: number;

  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  floorsDestination?: number;

  @IsInt()
  @Min(0)
  @Max(500)
  @IsOptional()
  parkingDistance?: number;

  @ValidateNested()
  @Type(() => MoveExtrasDto)
  @IsOptional()
  extras?: MoveExtrasDto;
}
