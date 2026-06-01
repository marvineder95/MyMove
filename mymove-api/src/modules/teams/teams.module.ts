import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamAvailability } from './entities/team-availability.entity';
import { TeamBooking } from './entities/team-booking.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamAvailability, TeamBooking])],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
