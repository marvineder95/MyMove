import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class MarkReadDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  messageIds: number[];
}
