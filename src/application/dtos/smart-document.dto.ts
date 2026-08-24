import { IsString, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class DraftSmartDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsOptional()
  documentDate?: string;

  @IsString()
  @IsOptional()
  responsible?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  attachmentsSummary?: string;

  @IsString()
  @IsOptional()
  tramiteSubtype?: string;

  @IsString()
  @IsOptional()
  subcategoryName?: string;
}

export class SaveSmartDocumentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  title?: string;
}
