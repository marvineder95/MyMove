import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './conversations.repository';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageFile } from './entities/message-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, MessageFile])],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository],
  exports: [ConversationsService],
})
export class ConversationsModule {}
