import { Injectable } from '@nestjs/common';
import { DraftSmartDocumentDto } from '../dtos/smart-document.dto';
import { AiService } from '../../infrastructure/ai/ai.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class DraftSmartDocumentUseCase {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: DraftSmartDocumentDto): Promise<{ content: string }> {
    const team = await this.prisma.teamSettings.findFirst();
    const docDate = dto.documentDate
      ? new Date(dto.documentDate).toLocaleDateString('es-PE')
      : new Date().toLocaleDateString('es-PE');

    const structured = this.buildTemplateDocument(dto, team, docDate);
    const enhanced = await this.aiService.draftFormalDocument(structured, {
      ...dto,
    } as unknown as Record<string, unknown>);
    return { content: enhanced || structured };
  }

  private buildTemplateDocument(
    dto: DraftSmartDocumentDto,
    team: { displayName: string; groupIdentifier: string } | null,
    docDate: string,
  ): string {
    const org = team?.displayName ?? 'KONTROLIA';
    const groupId = team?.groupIdentifier ?? 'GRUPO-001';
    const subtype = dto.tramiteSubtype ? `\nTipo de trámite: ${dto.tramiteSubtype}` : '';
    const subcategory = dto.subcategoryName ? `\nSubcategoría: ${dto.subcategoryName}` : '';

    return [
      `${org} — Documento Automático`,
      `Identificador de grupo: ${groupId}`,
      `Fecha: ${docDate}`,
      '',
      `ASUNTO: ${dto.title}`,
      '',
      `Responsable: ${dto.responsible || 'Por definir'}`,
      `Prioridad: ${dto.priority || 'BAJA'}`,
      `Ubicación: ${dto.location || 'No especificada'}${subtype}${subcategory}`,
      '',
      'CUERPO DEL DOCUMENTO',
      '────────────────────',
      dto.description || 'Sin descripción adicional.',
      '',
      dto.attachmentsSummary
        ? `ADJUNTOS REFERENCIADOS\n${dto.attachmentsSummary}`
        : 'ADJUNTOS REFERENCIADOS\nNinguno',
      '',
      'Atentamente,',
      dto.responsible || 'Equipo de trabajo',
    ].join('\n');
  }
}
