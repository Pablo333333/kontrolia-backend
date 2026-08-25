import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { Ticket } from '../../domain/entities/ticket.entity';

@Injectable()
export class SemanticSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async search(query: string, options?: { limit?: number; includeArchived?: boolean }) {
    const q = query.trim();
    if (!q) return [];

    const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
    const terms = await this.aiService.expandSearchQuery(q);

    const orClauses = terms.flatMap((term) => [
      { title: { contains: term, mode: 'insensitive' as const } },
      { description: { contains: term, mode: 'insensitive' as const } },
      { locationLabel: { contains: term, mode: 'insensitive' as const } },
      { messageType: { contains: term, mode: 'insensitive' as const } },
      { tramiteSubtype: { contains: term, mode: 'insensitive' as const } },
      {
        documents: {
          some: {
            OR: [
              { extractedText: { contains: term, mode: 'insensitive' as const } },
              { name: { contains: term, mode: 'insensitive' as const } },
            ],
          },
        },
      },
      {
        comments: {
          some: { content: { contains: term, mode: 'insensitive' as const } },
        },
      },
      {
        category: { name: { contains: term, mode: 'insensitive' as const } },
      },
      {
        subcategory: { name: { contains: term, mode: 'insensitive' as const } },
      },
    ]);

    const where: any = { OR: orClauses };
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
        if (haystack.includes(qLower)) score += 10;
        for (const term of terms) {
          const tl = term.toLowerCase();
          if (haystack.includes(tl)) score += 2;
          if (t.title?.toLowerCase().includes(tl)) score += 3;
        }

        return { ticket: t, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(({ ticket: t, score }) => {
      const lastComment = t.comments?.[0];
      return {
        ...new Ticket({
          ...t,
          categoryName: t.category?.name,
          subcategoryName: t.subcategory?.name ?? null,
          statusName: t.status?.name,
          remitenteName: t.user?.name ?? t.user?.email ?? null,
          destinatarioName: t.destinatario?.name ?? t.destinatario?.email ?? null,
          lastResponseContent: lastComment?.content ?? null,
          lastResponseAt: lastComment?.createdAt ?? null,
        } as any),
        relevanceScore: score,
        matchedTerms: terms.slice(0, 6),
      };
    });
  }
}
