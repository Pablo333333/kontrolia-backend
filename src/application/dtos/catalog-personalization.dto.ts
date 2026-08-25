import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, IsIn } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateSubcategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  categoryId: string;
}

export class UpdateSubcategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateTeamSettingsDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  groupIdentifier?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;
}

export class CreateDocumentFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateUserPreferenceDto {
  @IsString()
  @IsOptional()
  @IsIn(['active', 'historical'])
  defaultInboxView?: string;

  @IsString()
  @IsOptional()
  @IsIn(['literal', 'semantic'])
  searchMode?: string;

  @IsString()
  @IsOptional()
  preferredCategoryIds?: string;

  @IsBoolean()
  @IsOptional()
  notifyEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyPush?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyWhatsApp?: boolean;

  @IsString()
  @IsOptional()
  accentColor?: string;
}
