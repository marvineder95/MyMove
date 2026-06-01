import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { S3Service } from './services/s3.service';

/**
 * Global shared module that provides authentication guards, JWT infrastructure,
 * and S3 services to all feature modules without circular dependencies.
 */
@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'supabase-jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtAuthGuard, RolesGuard, S3Service],
  exports: [JwtAuthGuard, RolesGuard, JwtModule, PassportModule, S3Service],
})
export class SharedModule {}
