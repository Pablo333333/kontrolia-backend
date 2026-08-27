import { PrismaService } from '../prisma/prisma.service';
export type DocumentListItem = {
    id: string;
    name: string;
    url: string;
    type?: string | null;
    version: number;
    isLatest: boolean;
    createdAt: Date;
    folderId?: string | null;
    folderName?: string | null;
    ticketId?: string | null;
    ticketTitle?: string | null;
    categoryId?: string | null;
    categoryName?: string | null;
};
export declare class DocumentExportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listDocuments(filters: {
        q?: string;
        categoryId?: string;
        folderId?: string;
        limit?: number;
    }): Promise<DocumentListItem[]>;
    export(options: {
        format: 'csv' | 'pdf';
        q?: string;
        categoryId?: string;
        folderId?: string;
    }): Promise<{
        buffer: Buffer;
        contentType: string;
        filename: string;
    }>;
    private csvEscape;
}
