import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { MoveRequest } from '@modules/requests/entities/move-request.entity';
import { Offer } from '@modules/offers/entities/offer.entity';
import { TeamBooking } from '@modules/teams/entities/team-booking.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      MoveRequest,
      Offer,
      TeamBooking,
      Company,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
