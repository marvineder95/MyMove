import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@common/enums/user-role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(50, { message: 'Phone must not exceed 50 characters' })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: `Role must be one of: ${Object.values(UserRole).join(', ')}` })
  role?: UserRole;

  @IsOptional()
  @IsString({ message: 'Locale must be a string' })
  locale?: string;
}
