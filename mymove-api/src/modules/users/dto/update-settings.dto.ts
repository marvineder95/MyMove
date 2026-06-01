import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailNewOffers?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOfferUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  emailReminders?: boolean;
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  preferredMovingDays?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  preferredServices?: string;
}
