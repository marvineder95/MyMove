import { ValidateNested, ArrayMinSize, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItemDto } from './create-item.dto';

export class BulkItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  @ArrayMinSize(0)
  items: CreateItemDto[];
}
