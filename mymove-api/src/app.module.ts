import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '@config/database.config';
import { envValidationSchema } from '@config/env.validation';
import { SharedModule } from '@shared/shared.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { CompaniesModule } from '@modules/companies/companies.module';
import { RequestsModule } from '@modules/requests/requests.module';
import { PricingModule } from '@modules/pricing/pricing.module';
import { TeamsModule } from '@modules/teams/teams.module';
import { OffersModule } from '@modules/offers/offers.module';
import { ReviewsModule } from '@modules/reviews/reviews.module';
import { ConversationsModule } from '@modules/conversations/conversations.module';
import { HealthModule } from '@modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync(databaseConfig),
    SharedModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    RequestsModule,
    PricingModule,
    TeamsModule,
    OffersModule,
    ReviewsModule,
    ConversationsModule,
    HealthModule,
  ],
})
export class AppModule {}
