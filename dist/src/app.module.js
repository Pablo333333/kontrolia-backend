"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const tickets_module_1 = require("./presentation/tickets/tickets.module");
const auth_module_1 = require("./presentation/auth/auth.module");
const catalog_module_1 = require("./presentation/catalog/catalog.module");
const audit_module_1 = require("./presentation/audit/audit.module");
const socket_module_1 = require("./infrastructure/socket/socket.module");
const notification_module_1 = require("./infrastructure/notifications/notification.module");
const work_groups_module_1 = require("./presentation/work-groups/work-groups.module");
const prisma_module_1 = require("./infrastructure/prisma/prisma.module");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            tickets_module_1.TicketsModule,
            catalog_module_1.CatalogModule,
            audit_module_1.AuditPresentationModule,
            socket_module_1.SocketModule,
            notification_module_1.NotificationModule,
            work_groups_module_1.WorkGroupsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map