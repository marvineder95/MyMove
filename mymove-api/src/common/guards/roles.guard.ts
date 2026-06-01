import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@common/enums/user-role.enum';
import { ROLES_KEY } from '@common/decorators/roles.decorator';

interface RequestWithUser {
  user?: {
    userId: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

/**
 * Guard that enforces role-based access control.
 * Must be used after JwtAuthGuard to ensure request.user is populated.
 * Usage: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(UserRole.ADMIN)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access (auth-only endpoint)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => role === user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required role: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
