import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
  UpdateTeamSettingsDto,
  CreateDocumentFolderDto,
} from '../../application/dtos/catalog-personalization.dto';
import { DocumentExportService } from '../../infrastructure/documents/document-export.service';

@Controller('catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentExportService: DocumentExportService,
  ) {}

  @Get('categories')
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

  @Post('categories')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { name: dto.name.trim().toUpperCase(), description: dto.description },
      include: { subcategories: true },
    });
  }

  @Patch('categories/:id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim().toUpperCase() : undefined,
        description: dto.description,
      },
      include: { subcategories: true },
    });
  }

  @Delete('categories/:id')
  @Roles(Role.ADMIN)
  async deleteCategory(@Param('id') id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  @Get('subcategories')
  async getSubcategories() {
    return this.prisma.subcategory.findMany({
      orderBy: { name: 'asc' },
      include: { category: true },
    });
  }

  @Post('subcategories')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async createSubcategory(@Body() dto: CreateSubcategoryDto) {
    return this.prisma.subcategory.create({
      data: {
        name: dto.name.trim(),
        description: dto.description,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  }

  @Patch('subcategories/:id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async updateSubcategory(@Param('id') id: string, @Body() dto: UpdateSubcategoryDto) {
    return this.prisma.subcategory.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description,
      },
      include: { category: true },
    });
  }

  @Delete('subcategories/:id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async deleteSubcategory(@Param('id') id: string) {
    await this.prisma.subcategory.delete({ where: { id } });
    return { success: true };
  }

  @Get('team-settings')
  async getTeamSettings(@CurrentUser() user?: { userId: string }) {
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
          displayName: 'KONTROLIA',
          groupIdentifier: 'GRUPO-001',
          primaryColor: '#2563eb',
        },
      });
    }
    return settings;
  }

  @Patch('team-settings')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async updateTeamSettings(
    @Body() dto: UpdateTeamSettingsDto,
    @CurrentUser() user: { userId: string },
  ) {
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
        displayName: dto.displayName || 'KONTROLIA',
        groupIdentifier: dto.groupIdentifier || 'GRUPO-001',
        logoUrl: dto.logoUrl,
        primaryColor: dto.primaryColor || '#2563eb',
      },
    });
  }

  @Get('folders')
  async listFolders(@CurrentUser() user: { userId: string }) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { activeWorkGroupId: true },
    });
    if (!dbUser?.activeWorkGroupId) return [];

    return this.prisma.documentFolder.findMany({
      where: { workGroupId: dbUser.activeWorkGroupId },
      include: { _count: { select: { documents: true } } },
      orderBy: { name: 'asc' },
    });
  }

  @Post('folders')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async createFolder(
    @Body() dto: CreateDocumentFolderDto,
    @CurrentUser() user: { userId: string },
  ) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { activeWorkGroupId: true },
    });
    if (!dbUser?.activeWorkGroupId) {
      throw new BadRequestException('Selecciona un grupo de trabajo activo antes de crear carpetas');
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

  @Delete('folders/:id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async deleteFolder(@Param('id') id: string) {
    await this.prisma.documentFolder.delete({ where: { id } });
    return { success: true };
  }

  @Get('workflow-states')
  async getWorkflowStates() {
    return this.prisma.workflowState.findMany({
      orderBy: { name: 'asc' },
    });
  }

  @Get('users')
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

  @Get('documents')
  async listDocuments(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('folderId') folderId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.documentExportService.listDocuments({
      q,
      categoryId,
      folderId,
      limit: limit ? Number(limit) : 200,
    });
  }

  @Get('documents/export')
  async exportDocuments(
    @Query('format') format: 'csv' | 'pdf' = 'csv',
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('folderId') folderId?: string,
    @Res() res?: Response,
  ) {
    const result = await this.documentExportService.export({
      format: format === 'pdf' ? 'pdf' : 'csv',
      q,
      categoryId,
      folderId,
    });

    res!.setHeader('Content-Type', result.contentType);
    res!.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res!.send(result.buffer);
  }
}
