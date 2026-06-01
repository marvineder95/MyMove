import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTeamDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  @Type(() => Number)
  maxParallelJobs?: number = 1;
}

export class UpdateTeamDto {
  @IsString()
  @Length(1, 100)
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  @Type(() => Number)
  maxParallelJobs?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
