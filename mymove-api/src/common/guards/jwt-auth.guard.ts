import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

/**
 * Guard that validates JWT tokens on all protected routes.
 * Supports Supabase JWT format with local validation fallback.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    let payload: Record<string, unknown> | null = null;

    // Try local JWT first (JwtModule default secret), then Supabase JWT
    try {
      payload = await this.jwtService.verifyAsync(token) as Record<string, unknown>;
    } catch {
      const supabaseSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
      if (supabaseSecret) {
        try {
          payload = await this.jwtService.verifyAsync(token, { secret: supabaseSecret }) as Record<string, unknown>;
        } catch {
          // both failed
        }
      }
    }

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    // Normalize payload to our internal user shape
    request.user = {
      userId: String(payload.sub ?? payload.userId ?? payload.id),
      email: payload.email as string,
      role: (payload.role as string) || 'END_CUSTOMER',
      companyId: (payload.companyId as string) || undefined,
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
