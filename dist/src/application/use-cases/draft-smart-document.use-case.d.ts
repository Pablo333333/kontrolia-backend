import { DraftSmartDocumentDto } from '../dtos/smart-document.dto';
import { AiService } from '../../infrastructure/ai/ai.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class DraftSmartDocumentUseCase {
    private readonly aiService;
    private readonly prisma;
    constructor(aiService: AiService, prisma: PrismaService);
    execute(dto: DraftSmartDocumentDto): Promise<{
        content: string;
    }>;
    private buildTemplateDocument;
}
