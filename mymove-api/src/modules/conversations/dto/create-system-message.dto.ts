import { IsString, Length, IsInt, IsEnum } from 'class-validator';
import { MessageType, SenderType } from '../entities/message.entity';

export class CreateSystemMessageDto {
  @IsInt()
  conversationId: number;

  @IsString()
  @Length(1, 4000)
  content: string;

  @IsEnum(SenderType)
  senderType: SenderType = SenderType.SYSTEM;

  @IsEnum(MessageType)
  messageType: MessageType = MessageType.SYSTEM;
}
