import { Injectable } from '@nestjs/common';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Document>): Promise<Document> {
    const document = await this.prisma.document.create({
      data: {
        name: data.name!,
        url: data.url!,
        type: data.type,
        userId: data.userId!,
        ticketId: data.ticketId,
        version: data.version,
        isLatest: data.isLatest,
        extractedText: data.extractedText,
      },
    });

    return document;
  }

  async findByTicketId(ticketId: string): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Document | null> {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }
}
