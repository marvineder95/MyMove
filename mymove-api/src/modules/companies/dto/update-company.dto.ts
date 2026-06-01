import { IsString, MinLength, MaxLength, IsOptional, IsUrl, IsEmail, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyStatus } from '@modules/companies/entities/company.entity';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ description: 'Company name', example: 'Berlin Movers GmbH' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  companyName?: string;

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

  @ApiPropertyOptional({ description: 'Company banner image URL (http/https or data URI)', example: 'https://cdn.mymove.de/banners/company-banner.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'Company logo image URL (http/https or data URI)', example: 'https://cdn.mymove.de/logos/company-logo.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Year the company was founded', example: 2010 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  @Type(() => Number)
  foundingYear?: number;

  @ApiPropertyOptional({ description: 'Number of employees', example: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Primary contact person name', example: 'Max Mustermann' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'Support email address', example: 'support@berlinmovers.de' })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiPropertyOptional({ description: 'JSON array of enabled service keys', example: '["private_move","assembly","packing"]' })
  @IsOptional()
  @IsString()
  servicesJson?: string;

  @ApiPropertyOptional({ description: 'Main company location/city', example: 'Berlin' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  mainLocation?: string;

  @ApiPropertyOptional({ description: 'Operating radius in kilometers', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  operatingRadiusKm?: number;

  @ApiPropertyOptional({ description: 'JSON array of supported cities', example: '["Berlin","Potsdam","Brandenburg"]' })
  @IsOptional()
  @IsString()
  supportedCitiesJson?: string;

  @ApiPropertyOptional({ description: 'Whether international moves are supported', example: false })
  @IsOptional()
  @IsBoolean()
  internationalMoves?: boolean;

  @ApiPropertyOptional({ description: 'Maximum parallel jobs the company can handle', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxParallelJobs?: number;

  @ApiPropertyOptional({ description: 'Average response time in hours', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  avgResponseTimeHours?: number;

  @ApiPropertyOptional({ description: 'JSON string of service area zip codes or regions', example: '["10115","10117","10119"]' })
  @IsOptional()
  @IsString()
  serviceAreaJson?: string;

  @ApiPropertyOptional({ description: 'Company status', enum: CompanyStatus, example: CompanyStatus.APPROVED })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @ApiPropertyOptional({ description: 'Rejection reason when status is REJECTED', example: 'Invalid trade license' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
