import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export declare class SemanticSearchService {
    private readonly prisma;
    private readonly aiService;
    constructor(prisma: PrismaService, aiService: AiService);
    search(query: string, options?: {
        limit?: number;
        includeArchived?: boolean;
    }): Promise<{
        relevanceScore: number;
        matchedTerms: string[];
        id: string;
        title: string;
        description?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        locationLabel?: string | null;
        workflowStateId: string;
        categoryId: string;
        subcategoryId?: string | null;
        userId: string;
        priority: "BAJA" | "MEDIA" | "URGENTE";
        isArchived: boolean;
        destinatarioId?: string | null;
        messageType?: string | null;
        tramiteSubtype?: string | null;
        responseUrgency?: string | null;
        fechaLimite?: Date | null;
        parentTicketId?: string | null;
        rootTicketId?: string | null;
        isContinuation?: boolean;
        workGroupId?: string | null;
        createdAt: Date;
        updatedAt: Date;
        documents?: import("../../domain/entities/document.entity").Document[];
        history?: import("../../domain/entities/ticket-history.entity").TicketHistory[];
        comments?: import("../../domain/entities/comment.entity").Comment[];
        statusName?: string | null;
        categoryName?: string | null;
        subcategoryName?: string | null;
        destinatarioName?: string | null;
        remitenteName?: string | null;
        lastResponseContent?: string | null;
        lastResponseAt?: Date | null;
    }[]>;
}
