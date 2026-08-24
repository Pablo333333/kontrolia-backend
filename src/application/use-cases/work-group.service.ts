import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  CreateWorkGroupDto,
  UpdateWorkGroupDto,
  AddWorkGroupMemberDto,
  AssignWorkGroupTopicsDto,
} from '../dtos/work-group.dto';

@Injectable()
export class WorkGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string, role: string) {
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

  async findById(id: string) {
    const group = await this.prisma.workGroup.findUnique({
      where: { id },
      include: this.includeDetail(),
    });
    if (!group) throw new NotFoundException('Grupo de trabajo no encontrado');
    return group;
  }

  async create(dto: CreateWorkGroupDto, creatorUserId: string) {
    const existing = await this.prisma.workGroup.findUnique({
      where: { identifier: dto.identifier },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un grupo con identificador ${dto.identifier}`);
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

  async update(id: string, dto: UpdateWorkGroupDto) {
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

  async addMember(workGroupId: string, dto: AddWorkGroupMemberDto) {
    await this.findById(workGroupId);
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

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

  async removeMember(workGroupId: string, userId: string) {
    await this.prisma.workGroupMember.deleteMany({
      where: { workGroupId, userId },
    });
    return { success: true };
  }

  async assignTopics(workGroupId: string, dto: AssignWorkGroupTopicsDto) {
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

  async setActiveWorkGroup(userId: string, workGroupId: string, role: string) {
    const group = await this.findById(workGroupId);

    if (role !== 'ADMIN') {
      const membership = await this.prisma.workGroupMember.findUnique({
        where: { workGroupId_userId: { workGroupId, userId } },
      });
      if (!membership) {
        throw new ForbiddenException('No perteneces a este grupo de trabajo');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { activeWorkGroupId: workGroupId },
    });

    return group;
  }

  async getActiveForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        activeWorkGroup: { include: this.includeDetail() },
      },
    });

    if (user?.activeWorkGroup) return user.activeWorkGroup;

    const membership = await this.prisma.workGroupMember.findFirst({
      where: { userId },
      include: { workGroup: { include: this.includeDetail() } },
      orderBy: { createdAt: 'asc' },
    });

    return membership?.workGroup ?? null;
  }

  private includeDetail() {
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
}
