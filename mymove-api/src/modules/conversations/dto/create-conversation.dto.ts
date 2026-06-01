import { IsInt, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsInt()
  moveRequestId: number;

  @IsInt()
  companyId: number;

  @IsInt()
  @IsOptional()
  customerId?: number;
}
