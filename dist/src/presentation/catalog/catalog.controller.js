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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../infrastructure/auth/roles.guard");
const roles_decorator_1 = require("../../infrastructure/auth/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const catalog_personalization_dto_1 = require("../../application/dtos/catalog-personalization.dto");
const document_export_service_1 = require("../../infrastructure/documents/document-export.service");
let CatalogController = class CatalogController {
    prisma;
    documentExportService;
    constructor(prisma, documentExportService) {
        this.prisma = prisma;
        this.documentExportService = documentExportService;
    }
    async getMyPreferences(user) {
        let pref = await this.prisma.userPreference.findUnique({
            where: { userId: user.userId },
        });
        if (!pref) {
            pref = await this.prisma.userPreference.create({
                data: { userId: user.userId },
            });
        }
        return pref;
    }
    async updateMyPreferences(user, dto) {
        return this.prisma.userPreference.upsert({
            where: { userId: user.userId },
            create: {
                userId: user.userId,
                defaultInboxView: dto.defaultInboxView ?? 'active',
                searchMode: dto.searchMode ?? 'semantic',
                preferredCategoryIds: dto.preferredCategoryIds,
                notifyEmail: dto.notifyEmail ?? true,
                notifyPush: dto.notifyPush ?? true,
                notifyWhatsApp: dto.notifyWhatsApp ?? true,
                accentColor: dto.accentColor,
            },
            update: {
                defaultInboxView: dto.defaultInboxView,
                searchMode: dto.searchMode,
                preferredCategoryIds: dto.preferredCategoryIds,
                notifyEmail: dto.notifyEmail,
                notifyPush: dto.notifyPush,
                notifyWhatsApp: dto.notifyWhatsApp,
                accentColor: dto.accentColor,
            },
        });
    }
    async getCategories() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                subcategories: {
                    orderBy: { name: 'asc' },
                },
            },
        });
    }
    async createCategory(dto) {
        return this.prisma.category.create({
            data: { name: dto.name.trim().toUpperCase(), description: dto.description },
            include: { subcategories: true },
        });
    }
    async updateCategory(id, dto) {
        return this.prisma.category.update({
            where: { id },
            data: {
                name: dto.name ? dto.name.trim().toUpperCase() : undefined,
                description: dto.description,
            },
            include: { subcategories: true },
        });
    }
    async deleteCategory(id) {
        await this.prisma.category.delete({ where: { id } });
        return { success: true };
    }
    async getSubcategories() {
        return this.prisma.subcategory.findMany({
            orderBy: { name: 'asc' },
            include: { category: true },
        });
    }
    async createSubcategory(dto) {
        return this.prisma.subcategory.create({
            data: {
                name: dto.name.trim(),
                description: dto.description,
                categoryId: dto.categoryId,
            },
            include: { category: true },
        });
    }
    async updateSubcategory(id, dto) {
        return this.prisma.subcategory.update({
            where: { id },
            data: {
                name: dto.name?.trim(),
                description: dto.description,
            },
            include: { category: true },
        });
    }
    async deleteSubcategory(id) {
        await this.prisma.subcategory.delete({ where: { id } });
        return { success: true };
    }
    async getTeamSettings(user) {
        if (user?.userId) {
            const dbUser = await this.prisma.user.findUnique({
                where: { id: user.userId },
                include: { activeWorkGroup: true },
            });
            if (dbUser?.activeWorkGroup) {
                const g = dbUser.activeWorkGroup;
                return {
                    id: g.id,
                    displayName: g.name,
                    groupIdentifier: g.identifier,
                    logoUrl: g.logoUrl,
                    primaryColor: g.primaryColor,
                    workGroupId: g.id,
                };
            }
        }
        let settings = await this.prisma.teamSettings.findFirst();
        if (!settings) {
            settings = await this.prisma.teamSettings.create({
                data: {
                    displayName: 'CONECTA',
                    groupIdentifier: 'GRUPO-001',
                    primaryColor: '#2563eb',
                },
            });
        }
        return settings;
    }
    async updateTeamSettings(dto, user) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.userId },
            select: { activeWorkGroupId: true },
        });
        if (dbUser?.activeWorkGroupId) {
            return this.prisma.workGroup.update({
                where: { id: dbUser.activeWorkGroupId },
                data: {
                    name: dto.displayName,
                    identifier: dto.groupIdentifier,
                    logoUrl: dto.logoUrl,
                    primaryColor: dto.primaryColor,
                },
            });
        }
        const existing = await this.prisma.teamSettings.findFirst();
        if (existing) {
            return this.prisma.teamSettings.update({
                where: { id: existing.id },
                data: dto,
            });
        }
        return this.prisma.teamSettings.create({
            data: {
                displayName: dto.displayName || 'CONECTA',
                groupIdentifier: dto.groupIdentifier || 'GRUPO-001',
                logoUrl: dto.logoUrl,
                primaryColor: dto.primaryColor || '#2563eb',
            },
        });
    }
    async listFolders(user) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.userId },
            select: { activeWorkGroupId: true },
        });
        if (!dbUser?.activeWorkGroupId)
            return [];
        return this.prisma.documentFolder.findMany({
            where: { workGroupId: dbUser.activeWorkGroupId },
            include: { _count: { select: { documents: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async createFolder(dto, user) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.userId },
            select: { activeWorkGroupId: true },
        });
        if (!dbUser?.activeWorkGroupId) {
            throw new common_1.BadRequestException('Selecciona un grupo de trabajo activo antes de crear carpetas');
        }
        const prefix = `groups/${dbUser.activeWorkGroupId}/${dto.name.toLowerCase().replace(/\s+/g, '-')}`;
        return this.prisma.documentFolder.create({
            data: {
                name: dto.name.trim(),
                description: dto.description,
                workGroupId: dbUser.activeWorkGroupId,
                cloudinaryPrefix: prefix,
            },
        });
    }
    async deleteFolder(id) {
        await this.prisma.documentFolder.delete({ where: { id } });
        return { success: true };
    }
    async getWorkflowStates() {
        return this.prisma.workflowState.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async getUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async listDocuments(q, categoryId, folderId, limit) {
        return this.documentExportService.listDocuments({
            q,
            categoryId,
            folderId,
            limit: limit ? Number(limit) : 200,
        });
    }
    async exportDocuments(format = 'csv', q, categoryId, folderId, res) {
        const result = await this.documentExportService.export({
            format: format === 'pdf' ? 'pdf' : 'csv',
            q,
            categoryId,
            folderId,
        });
        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        return res.send(result.buffer);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)('me/preferences'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getMyPreferences", null);
__decorate([
    (0, common_1.Patch)('me/preferences'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, catalog_personalization_dto_1.UpdateUserPreferenceDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateMyPreferences", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalog_personalization_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, catalog_personalization_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('subcategories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getSubcategories", null);
__decorate([
    (0, common_1.Post)('subcategories'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalog_personalization_dto_1.CreateSubcategoryDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createSubcategory", null);
__decorate([
    (0, common_1.Patch)('subcategories/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, catalog_personalization_dto_1.UpdateSubcategoryDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateSubcategory", null);
__decorate([
    (0, common_1.Delete)('subcategories/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteSubcategory", null);
__decorate([
    (0, common_1.Get)('team-settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getTeamSettings", null);
__decorate([
    (0, common_1.Patch)('team-settings'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalog_personalization_dto_1.UpdateTeamSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateTeamSettings", null);
__decorate([
    (0, common_1.Get)('folders'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "listFolders", null);
__decorate([
    (0, common_1.Post)('folders'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalog_personalization_dto_1.CreateDocumentFolderDto, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Delete)('folders/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteFolder", null);
__decorate([
    (0, common_1.Get)('workflow-states'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getWorkflowStates", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('documents'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('folderId')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "listDocuments", null);
__decorate([
    (0, common_1.Get)('documents/export'),
    __param(0, (0, common_1.Query)('format')),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('folderId')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "exportDocuments", null);
exports.CatalogController = CatalogController = __decorate([
    (0, common_1.Controller)('catalog'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_export_service_1.DocumentExportService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map