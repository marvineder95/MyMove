import { IsString, MinLength, MaxLength, IsOptional, IsUrl, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name', example: 'Berlin Movers GmbH' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  companyName: string;

  @ApiPropertyOptional({ description: 'Company description', example: 'Professional moving services in Berlin' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Company website URL', example: 'https://berlinmovers.de' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Company phone number', example: '+49 30 12345678' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Company email address', example: 'info@berlinmovers.de' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Tax ID / VAT number', example: 'DE123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ description: 'JSON string of service area zip codes or regions', example: '["10115","10117","10119"]' })
  @IsOptional()
  @IsString()
  serviceAreaJson?: string;
}
