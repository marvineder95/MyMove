import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyPricing } from './entities/company-pricing.entity';
import { CompanyDocument } from '@modules/companies/entities/company-document.entity';
import { PricingService } from './pricing.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyPricing, CompanyDocument])],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
