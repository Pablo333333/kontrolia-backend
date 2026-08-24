import { Injectable, Inject } from '@nestjs/common';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    @Inject(IDocumentRepository)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(data: { name: string; url: string; type: string; userId: string; ticketId: string; version?: number; isLatest?: boolean; extractedText?: string }): Promise<Document> {
    return this.documentRepository.create({
      name: data.name,
      url: data.url,
      type: data.type,
      userId: data.userId,
      ticketId: data.ticketId,
      version: data.version || 1,
      isLatest: data.isLatest ?? true,
      extractedText: data.extractedText,
    });
  }
}
