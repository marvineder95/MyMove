import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class DevLoginDto {
  @IsString()
  @IsIn(['admin', 'company', 'end_customer'])
  role: 'admin' | 'company' | 'end_customer';
}

/**
 * DTO for registering an end-customer account.
 */
export class RegisterCustomerDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['de', 'en', 'fr', 'es', 'it', 'nl', 'pl'], {
    message: 'Locale must be one of the supported values',
  })
  locale?: string = 'de';
}

/**
 * DTO for registering a company account.
 * Extends customer fields and adds company-specific data.
 */
export class RegisterCompanyDto extends RegisterCustomerDto {
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  @MaxLength(200, { message: 'Company name must not exceed 200 characters' })
  companyName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Website URL must not exceed 500 characters' })
  website?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Tax ID must not exceed 50 characters' })
  taxId?: string;
}

/**
 * DTO for logging into an existing account.
 */
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
