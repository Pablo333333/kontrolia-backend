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
exports.WorkGroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let WorkGroupService = class WorkGroupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForUser(userId, role) {
        if (role === 'ADMIN') {
            return this.prisma.workGroup.findMany({
                include: this.includeDetail(),
                orderBy: { name: 'asc' },
            });
        }
        return this.prisma.workGroup.findMany({
            where: {
                isActive: true,
                members: { some: { userId } },
            },
            include: this.includeDetail(),
            orderBy: { name: 'asc' },
        });
    }
    async findById(id) {
        const group = await this.prisma.workGroup.findUnique({
            where: { id },
            include: this.includeDetail(),
        });
        if (!group)
            throw new common_1.NotFoundException('Grupo de trabajo no encontrado');
        return group;
    }
    async create(dto, creatorUserId) {
        const existing = await this.prisma.workGroup.findUnique({
            where: { identifier: dto.identifier },
        });
        if (existing) {
            throw new common_1.ConflictException(`Ya existe un grupo con identificador ${dto.identifier}`);
        }
        return this.prisma.workGroup.create({
            data: {
                name: dto.name,
                identifier: dto.identifier.toUpperCase().replace(/\s+/g, '-'),
                description: dto.description,
                logoUrl: dto.logoUrl,
                primaryColor: dto.primaryColor || '#2563eb',
                members: {
                    create: {
                        userId: creatorUserId,
                        roleInGroup: 'LEAD',
                    },
                },
            },
            include: this.includeDetail(),
        });
    }
    async update(id, dto) {
        await this.findById(id);
        return this.prisma.workGroup.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                logoUrl: dto.logoUrl,
                primaryColor: dto.primaryColor,
                isActive: dto.isActive,
            },
            include: this.includeDetail(),
        });
    }
    async addMember(workGroupId, dto) {
        await this.findById(workGroupId);
        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return this.prisma.workGroupMember.upsert({
            where: {
                workGroupId_userId: { workGroupId, userId: dto.userId },
            },
            create: {
                workGroupId,
                userId: dto.userId,
                roleInGroup: dto.roleInGroup || 'MEMBER',
            },
            update: {
                roleInGroup: dto.roleInGroup || 'MEMBER',
            },
            include: {
                user: { select: { id: true, name: true, email: true, role: true, phone: true } },
            },
        });
    }
    async removeMember(workGroupId, userId) {
        await this.prisma.workGroupMember.deleteMany({
            where: { workGroupId, userId },
        });
        return { success: true };
    }
    async assignTopics(workGroupId, dto) {
        await this.findById(workGroupId);
        await this.prisma.workGroupTopic.deleteMany({ where: { workGroupId } });
        if (dto.categoryIds.length > 0) {
            await this.prisma.workGroupTopic.createMany({
                data: dto.categoryIds.map(categoryId => ({ workGroupId, categoryId })),
                skipDuplicates: true,
            });
        }
        return this.findById(workGroupId);
    }
    async setActiveWorkGroup(userId, workGroupId, role) {
        const group = await this.findById(workGroupId);
        if (role !== 'ADMIN') {
            const membership = await this.prisma.workGroupMember.findUnique({
                where: { workGroupId_userId: { workGroupId, userId } },
            });
            if (!membership) {
                throw new common_1.ForbiddenException('No perteneces a este grupo de trabajo');
            }
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { activeWorkGroupId: workGroupId },
        });
        return group;
    }
    async getActiveForUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                activeWorkGroup: { include: this.includeDetail() },
            },
        });
        if (user?.activeWorkGroup)
            return user.activeWorkGroup;
        const membership = await this.prisma.workGroupMember.findFirst({
            where: { userId },
            include: { workGroup: { include: this.includeDetail() } },
            orderBy: { createdAt: 'asc' },
        });
        return membership?.workGroup ?? null;
    }
    includeDetail() {
        return {
            members: {
                include: {
                    user: { select: { id: true, name: true, email: true, role: true, phone: true } },
                },
            },
            topics: {
                include: {
                    category: { select: { id: true, name: true, description: true } },
                },
            },
            _count: { select: { tickets: true, members: true } },
        };
    }
};
exports.WorkGroupService = WorkGroupService;
exports.WorkGroupService = WorkGroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkGroupService);
//# sourceMappingURL=work-group.service.js.map