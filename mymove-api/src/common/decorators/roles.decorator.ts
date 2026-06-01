import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access a route.
 * Usage: @Roles(UserRole.ADMIN, UserRole.COMPANY)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
