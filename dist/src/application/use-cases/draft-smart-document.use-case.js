"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftSmartDocumentUseCase = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../../infrastructure/ai/ai.service");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let DraftSmartDocumentUseCase = class DraftSmartDocumentUseCase {
    aiService;
    prisma;
    constructor(aiService, prisma) {
        this.aiService = aiService;
        this.prisma = prisma;
    }
    async execute(dto) {
        const team = await this.prisma.teamSettings.findFirst();
        const docDate = dto.documentDate
            ? new Date(dto.documentDate).toLocaleDateString('es-PE')
            : new Date().toLocaleDateString('es-PE');
        const structured = this.buildTemplateDocument(dto, team, docDate);
        const enhanced = await this.aiService.draftFormalDocument(structured, {
            ...dto,
        });
        return { content: enhanced || structured };
    }
    buildTemplateDocument(dto, team, docDate) {
        const org = team?.displayName ?? 'CONECTA';
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
};
exports.DraftSmartDocumentUseCase = DraftSmartDocumentUseCase;
exports.DraftSmartDocumentUseCase = DraftSmartDocumentUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        prisma_service_1.PrismaService])
], DraftSmartDocumentUseCase);
//# sourceMappingURL=draft-smart-document.use-case.js.map