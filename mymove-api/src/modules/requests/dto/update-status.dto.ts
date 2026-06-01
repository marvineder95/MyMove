import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { MoveRequestStatus } from '../entities/move-request.entity';

export class UpdateStatusDto {
  @IsEnum(MoveRequestStatus)
  status: MoveRequestStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  selectedCompanyId?: number;
}
