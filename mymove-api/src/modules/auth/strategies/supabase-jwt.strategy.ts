import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SupabaseJwtPayload {
  sub: string;
  email: string;
  role?: string;
  userId?: string;
  id?: string;
  aud?: string;
  exp?: number;
  iat?: number;
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Passport JWT strategy that validates Supabase-issued bearer tokens.
 * Expects the token in the Authorization header as a Bearer token.
 */
@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('SUPABASE_JWT_SECRET');

    if (!secret) {
      throw new Error('SUPABASE_JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: SupabaseJwtPayload): Promise<AuthUserPayload> {
    if (!payload.sub && !payload.userId && !payload.id) {
      throw new UnauthorizedException('Invalid token: missing user identifier');
    }

    if (!payload.email) {
      throw new UnauthorizedException('Invalid token: missing email');
    }

    const userId = payload.sub || payload.userId || payload.id;

    return {
      userId: String(userId),
      email: payload.email,
      role: payload.role || 'END_CUSTOMER',
    };
  }
}
