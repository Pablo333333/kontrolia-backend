import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, IsEnum, IsDateString } from 'class-validator';

enum TicketPriority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  URGENTE = 'URGENTE',
}

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsUUID()
  @IsOptional()
  subcategoryId?: string;

  @IsUUID()
  @IsNotEmpty()
  workflowStateId: string;

  @IsUUID()
  @IsOptional()
  destinatarioId?: string;

  @IsString()
  @IsOptional()
  messageType?: string;

  @IsString()
  @IsOptional()
  tramiteSubtype?: string;

  @IsString()
  @IsOptional()
  responseUrgency?: string;

  @IsDateString()
  @IsOptional()
  fechaLimite?: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsString()
  @IsOptional()
  locationLabel?: string;

  @IsUUID()
  @IsOptional()
  parentTicketId?: string;
}
