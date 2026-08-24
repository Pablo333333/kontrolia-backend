import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray, IsBoolean } from 'class-validator';

export class CreateWorkGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;
}

export class UpdateWorkGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddWorkGroupMemberDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  roleInGroup?: string; // LEAD | MEMBER
}

export class AssignWorkGroupTopicsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}

export class SetActiveWorkGroupDto {
  @IsUUID()
  workGroupId: string;
}

export class UpdateUserContactDto {
  @IsString()
  @IsOptional()
  phone?: string;
}
