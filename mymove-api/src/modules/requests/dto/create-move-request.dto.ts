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
  assemblyRequired?: boolean = false;

  @IsBoolean()
  @IsOptional()
  boxesNeeded?: boolean = false;

  @IsBoolean()
  @IsOptional()
  noParkingZoneRequired?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isFlexibleDate?: boolean = false;

  @IsBoolean()
  @IsOptional()
  elevatorOrigin?: boolean = false;

  @IsBoolean()
  @IsOptional()
  elevatorDestination?: boolean = false;

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
  additionalInsurance?: boolean = false;

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

export class CreateMoveRequestDto {
  @IsString()
  @Length(5, 500)
  originAddress: string;

  @IsString()
  @Length(5, 500)
  destinationAddress: string;

  @IsDateString()
  moveDate: string;

  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  floorsOrigin?: number = 0;

  @IsInt()
  @Min(0)
  @Max(50)
  @IsOptional()
  floorsDestination?: number = 0;

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
