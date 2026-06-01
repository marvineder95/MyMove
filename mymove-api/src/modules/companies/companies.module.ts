import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyDocument } from './entities/company-document.entity';
import { CompaniesRepository } from './companies.repository';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PricingModule } from '@modules/pricing/pricing.module';
import { TeamsModule } from '@modules/teams/teams.module';
import { OffersModule } from '@modules/offers/offers.module';
import { RequestsModule } from '@modules/requests/requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyDocument]),
    PricingModule,
    TeamsModule,
    OffersModule,
    RequestsModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesService, CompaniesRepository],
})
export class CompaniesModule {}
