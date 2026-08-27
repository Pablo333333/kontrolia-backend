import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
export declare class UploadDocumentUseCase {
    private readonly documentRepository;
    constructor(documentRepository: IDocumentRepository);
    execute(data: {
        name: string;
        url: string;
        type: string;
        userId: string;
        ticketId: string;
        version?: number;
        isLatest?: boolean;
        extractedText?: string;
    }): Promise<Document>;
}
