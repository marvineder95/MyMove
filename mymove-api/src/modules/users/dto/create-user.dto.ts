import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@common/enums/user-role.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(50, { message: 'Phone must not exceed 50 characters' })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: `Role must be one of: ${Object.values(UserRole).join(', ')}` })
  role?: UserRole;

  @IsOptional()
  @IsString({ message: 'Locale must be a string' })
  locale?: string = 'de';
}
