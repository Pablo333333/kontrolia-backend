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
exports.WorkGroupsController = void 0;
const common_1 = require("@nestjs/common");
const work_group_service_1 = require("../../application/use-cases/work-group.service");
const work_group_dto_1 = require("../../application/dtos/work-group.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../infrastructure/auth/roles.guard");
const roles_decorator_1 = require("../../infrastructure/auth/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const daily_digest_service_1 = require("../../infrastructure/notifications/daily-digest.service");
let WorkGroupsController = class WorkGroupsController {
    workGroupService;
    prisma;
    dailyDigestService;
    constructor(workGroupService, prisma, dailyDigestService) {
        this.workGroupService = workGroupService;
        this.prisma = prisma;
        this.dailyDigestService = dailyDigestService;
    }
    async list(user) {
        return this.workGroupService.listForUser(user.userId, user.role);
    }
    async getActive(user) {
        return this.workGroupService.getActiveForUser(user.userId);
    }
    async setActive(dto, user) {
        return this.workGroupService.setActiveWorkGroup(user.userId, dto.workGroupId, user.role);
    }
    async updateContact(dto, user) {
        return this.prisma.user.update({
            where: { id: user.userId },
            data: { phone: dto.phone },
            select: { id: true, email: true, name: true, phone: true, role: true },
        });
    }
    async runDigestNow() {
        return this.dailyDigestService.sendDigest();
    }
    async create(dto, user) {
        return this.workGroupService.create(dto, user.userId);
    }
    async findOne(id) {
        return this.workGroupService.findById(id);
    }
    async update(id, dto) {
        return this.workGroupService.update(id, dto);
    }
    async addMember(id, dto) {
        return this.workGroupService.addMember(id, dto);
    }
    async removeMember(id, userId) {
        return this.workGroupService.removeMember(id, userId);
    }
    async assignTopics(id, dto) {
        return this.workGroupService.assignTopics(id, dto);
    }
};
exports.WorkGroupsController = WorkGroupsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "getActive", null);
__decorate([
    (0, common_1.Post)('active'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_group_dto_1.SetActiveWorkGroupDto, Object]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "setActive", null);
__decorate([
    (0, common_1.Patch)('me/contact'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_group_dto_1.UpdateUserContactDto, Object]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "updateContact", null);
__decorate([
    (0, common_1.Post)('digest/run'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "runDigestNow", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_group_dto_1.CreateWorkGroupDto, Object]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, work_group_dto_1.UpdateWorkGroupDto]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, work_group_dto_1.AddWorkGroupMemberDto]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/topics'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, work_group_dto_1.AssignWorkGroupTopicsDto]),
    __metadata("design:returntype", Promise)
], WorkGroupsController.prototype, "assignTopics", null);
exports.WorkGroupsController = WorkGroupsController = __decorate([
    (0, common_1.Controller)('work-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [work_group_service_1.WorkGroupService,
        prisma_service_1.PrismaService,
        daily_digest_service_1.DailyDigestService])
], WorkGroupsController);
//# sourceMappingURL=work-groups.controller.js.map