import type { Response } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateSubcategoryDto, UpdateSubcategoryDto, UpdateTeamSettingsDto, CreateDocumentFolderDto, UpdateUserPreferenceDto } from '../../application/dtos/catalog-personalization.dto';
import { DocumentExportService } from '../../infrastructure/documents/document-export.service';
export declare class CatalogController {
    private readonly prisma;
    private readonly documentExportService;
    constructor(prisma: PrismaService, documentExportService: DocumentExportService);
    getMyPreferences(user: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        defaultInboxView: string;
        searchMode: string;
        preferredCategoryIds: string | null;
        notifyEmail: boolean;
        notifyPush: boolean;
        notifyWhatsApp: boolean;
        accentColor: string | null;
    }>;
    updateMyPreferences(user: {
        userId: string;
    }, dto: UpdateUserPreferenceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        defaultInboxView: string;
        searchMode: string;
        preferredCategoryIds: string | null;
        notifyEmail: boolean;
        notifyPush: boolean;
        notifyWhatsApp: boolean;
        accentColor: string | null;
    }>;
    getCategories(): Promise<({
        subcategories: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            categoryId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    })[]>;
    createCategory(dto: CreateCategoryDto): Promise<{
        subcategories: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            categoryId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        subcategories: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            categoryId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    deleteCategory(id: string): Promise<{
        success: boolean;
    }>;
    getSubcategories(): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryId: string;
    })[]>;
    createSubcategory(dto: CreateSubcategoryDto): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryId: string;
    }>;
    updateSubcategory(id: string, dto: UpdateSubcategoryDto): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryId: string;
    }>;
    deleteSubcategory(id: string): Promise<{
        success: boolean;
    }>;
    getTeamSettings(user?: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayName: string;
        groupIdentifier: string;
        logoUrl: string | null;
        primaryColor: string;
    } | {
        id: string;
        displayName: string;
        groupIdentifier: string;
        logoUrl: string | null;
        primaryColor: string;
        workGroupId: string;
    }>;
    updateTeamSettings(dto: UpdateTeamSettingsDto, user: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayName: string;
        groupIdentifier: string;
        logoUrl: string | null;
        primaryColor: string;
    } | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        primaryColor: string;
        identifier: string;
        isActive: boolean;
    }>;
    listFolders(user: {
        userId: string;
    }): Promise<({
        _count: {
            documents: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        workGroupId: string;
        cloudinaryPrefix: string | null;
    })[]>;
    createFolder(dto: CreateDocumentFolderDto, user: {
        userId: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        workGroupId: string;
        cloudinaryPrefix: string | null;
    }>;
    deleteFolder(id: string): Promise<{
        success: boolean;
    }>;
    getWorkflowStates(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    getUsers(): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
    }[]>;
    listDocuments(q?: string, categoryId?: string, folderId?: string, limit?: string): Promise<import("../../infrastructure/documents/document-export.service").DocumentListItem[]>;
    exportDocuments(format?: 'csv' | 'pdf', q?: string, categoryId?: string, folderId?: string, res?: Response): Promise<Response<any, Record<string, any>>>;
}
