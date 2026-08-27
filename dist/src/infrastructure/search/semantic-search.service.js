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
exports.SemanticSearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const ticket_entity_1 = require("../../domain/entities/ticket.entity");
let SemanticSearchService = class SemanticSearchService {
    prisma;
    aiService;
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async search(query, options) {
        const q = query.trim();
        if (!q)
            return [];
        const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
        const terms = await this.aiService.expandSearchQuery(q);
        const orClauses = terms.flatMap((term) => [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { locationLabel: { contains: term, mode: 'insensitive' } },
            { messageType: { contains: term, mode: 'insensitive' } },
            { tramiteSubtype: { contains: term, mode: 'insensitive' } },
            {
                documents: {
                    some: {
                        OR: [
                            { extractedText: { contains: term, mode: 'insensitive' } },
                            { name: { contains: term, mode: 'insensitive' } },
                        ],
                    },
                },
            },
            {
                comments: {
                    some: { content: { contains: term, mode: 'insensitive' } },
                },
            },
            {
                category: { name: { contains: term, mode: 'insensitive' } },
            },
            {
                subcategory: { name: { contains: term, mode: 'insensitive' } },
            },
        ]);
        const where = { OR: orClauses };
        if (!options?.includeArchived) {
            where.isArchived = false;
        }
        const tickets = await this.prisma.ticket.findMany({
            where,
            take: Math.min(limit * 3, 150),
            include: {
                category: { select: { id: true, name: true } },
                subcategory: { select: { id: true, name: true } },
                status: { select: { id: true, name: true } },
                user: { select: { id: true, name: true, email: true } },
                destinatario: { select: { id: true, name: true, email: true } },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { content: true, createdAt: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        const scored = tickets
            .map((t) => {
            const haystack = [
                t.title,
                t.description,
                t.locationLabel,
                t.messageType,
                t.tramiteSubtype,
                t.category?.name,
                t.subcategory?.name,
                t.user?.name,
                t.destinatario?.name,
                t.comments?.[0]?.content,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            let score = 0;
            const qLower = q.toLowerCase();
            if (haystack.includes(qLower))
                score += 10;
            for (const term of terms) {
                const tl = term.toLowerCase();
                if (haystack.includes(tl))
                    score += 2;
                if (t.title?.toLowerCase().includes(tl))
                    score += 3;
            }
            return { ticket: t, score };
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        return scored.map(({ ticket: t, score }) => {
            const lastComment = t.comments?.[0];
            return {
                ...new ticket_entity_1.Ticket({
                    ...t,
                    categoryName: t.category?.name,
                    subcategoryName: t.subcategory?.name ?? null,
                    statusName: t.status?.name,
                    remitenteName: t.user?.name ?? t.user?.email ?? null,
                    destinatarioName: t.destinatario?.name ?? t.destinatario?.email ?? null,
                    lastResponseContent: lastComment?.content ?? null,
                    lastResponseAt: lastComment?.createdAt ?? null,
                }),
                relevanceScore: score,
                matchedTerms: terms.slice(0, 6),
            };
        });
    }
};
exports.SemanticSearchService = SemanticSearchService;
exports.SemanticSearchService = SemanticSearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], SemanticSearchService);
//# sourceMappingURL=semantic-search.service.js.map