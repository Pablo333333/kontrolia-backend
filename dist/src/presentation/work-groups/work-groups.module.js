"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkGroupsModule = void 0;
const common_1 = require("@nestjs/common");
const work_groups_controller_1 = require("./work-groups.controller");
const work_group_service_1 = require("../../application/use-cases/work-group.service");
const prisma_module_1 = require("../../infrastructure/prisma/prisma.module");
const notification_module_1 = require("../../infrastructure/notifications/notification.module");
let WorkGroupsModule = class WorkGroupsModule {
};
exports.WorkGroupsModule = WorkGroupsModule;
exports.WorkGroupsModule = WorkGroupsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notification_module_1.NotificationModule],
        controllers: [work_groups_controller_1.WorkGroupsController],
        providers: [work_group_service_1.WorkGroupService],
        exports: [work_group_service_1.WorkGroupService],
    })
], WorkGroupsModule);
//# sourceMappingURL=work-groups.module.js.map