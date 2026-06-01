import { IsString, Length, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class SendMessageDto {
  @IsString()
  @Length(1, 4000)
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType = MessageType.TEXT;
}
