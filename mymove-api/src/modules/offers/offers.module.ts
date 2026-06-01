import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { MoveRequest } from '@modules/requests/entities/move-request.entity';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { TeamsModule } from '@modules/teams/teams.module';
import { ConversationsModule } from '@modules/conversations/conversations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, MoveRequest]),
    TeamsModule,
    ConversationsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
