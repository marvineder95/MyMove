import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseJwtStrategy } from './strategies/supabase-jwt.strategy';
import { UsersModule } from '@modules/users/users.module';
import { CompaniesModule } from '@modules/companies/companies.module';

@Module({
  imports: [UsersModule, CompaniesModule],
  providers: [AuthService, SupabaseJwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
