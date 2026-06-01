import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

/**
 * Decorator to extract the authenticated user from the request.
 * Usage: @CurrentUser() user: AuthUser
 */
export const CurrentUser = createParamDecorator<
  keyof NonNullable<AuthenticatedRequest['user']> | undefined
>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
