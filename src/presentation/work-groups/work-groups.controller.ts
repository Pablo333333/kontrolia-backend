import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WorkGroupService } from '../../application/use-cases/work-group.service';
import {
  CreateWorkGroupDto,
  UpdateWorkGroupDto,
  AddWorkGroupMemberDto,
  AssignWorkGroupTopicsDto,
  SetActiveWorkGroupDto,
  UpdateUserContactDto,
} from '../../application/dtos/work-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DailyDigestService } from '../../infrastructure/notifications/daily-digest.service';

@Controller('work-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkGroupsController {
  constructor(
    private readonly workGroupService: WorkGroupService,
    private readonly prisma: PrismaService,
    private readonly dailyDigestService: DailyDigestService,
  ) {}

  @Get()
  async list(@CurrentUser() user: { userId: string; role: string }) {
    return this.workGroupService.listForUser(user.userId, user.role);
  }

  @Get('active')
  async getActive(@CurrentUser() user: { userId: string }) {
    return this.workGroupService.getActiveForUser(user.userId);
  }

  @Post('active')
  async setActive(
    @Body() dto: SetActiveWorkGroupDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.workGroupService.setActiveWorkGroup(user.userId, dto.workGroupId, user.role);
  }

  @Patch('me/contact')
  async updateContact(
    @Body() dto: UpdateUserContactDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.prisma.user.update({
      where: { id: user.userId },
      data: { phone: dto.phone },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
  }

  @Post('digest/run')
  @Roles(Role.ADMIN)
  async runDigestNow() {
    return this.dailyDigestService.sendDigest();
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async create(
    @Body() dto: CreateWorkGroupDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.workGroupService.create(dto, user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workGroupService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async update(@Param('id') id: string, @Body() dto: UpdateWorkGroupDto) {
    return this.workGroupService.update(id, dto);
  }

  @Post(':id/members')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async addMember(@Param('id') id: string, @Body() dto: AddWorkGroupMemberDto) {
    return this.workGroupService.addMember(id, dto);
  }

  @Delete(':id/members/:userId')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.workGroupService.removeMember(id, userId);
  }

  @Post(':id/topics')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async assignTopics(@Param('id') id: string, @Body() dto: AssignWorkGroupTopicsDto) {
    return this.workGroupService.assignTopics(id, dto);
  }
}
