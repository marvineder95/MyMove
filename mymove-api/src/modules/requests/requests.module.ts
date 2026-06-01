import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoveRequest } from './entities/move-request.entity';
import { RequestVideo } from './entities/request-video.entity';
import { MoveRequestItem } from './entities/move-request-item.entity';
import { Offer } from '@modules/offers/entities/offer.entity';
import { RequestsRepository } from './requests.repository';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { PricingModule } from '@modules/pricing/pricing.module';
import { TeamsModule } from '@modules/teams/teams.module';
import { ConversationsModule } from '@modules/conversations/conversations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MoveRequest, RequestVideo, MoveRequestItem, Offer]),
    PricingModule,
    TeamsModule,
    ConversationsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService, RequestsRepository],
  exports: [RequestsService, RequestsRepository],
})
export class RequestsModule {}
