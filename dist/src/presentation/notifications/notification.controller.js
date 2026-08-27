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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const notification_service_1 = require("../../infrastructure/notifications/notification.service");
const overdue_reminder_service_1 = require("../../infrastructure/notifications/overdue-reminder.service");
let NotificationController = class NotificationController {
    notificationService;
    overdueReminderService;
    constructor(notificationService, overdueReminderService) {
        this.notificationService = notificationService;
        this.overdueReminderService = overdueReminderService;
    }
    async registerToken(req, token) {
        await this.notificationService.registerToken(req.user.userId, token);
        return { success: true, message: 'Push token registered successfully' };
    }
    async getReport() {
        return this.overdueReminderService.checkOverdueAndPending();
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('register-token'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "registerToken", null);
__decorate([
    (0, common_1.Get)('report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getReport", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        overdue_reminder_service_1.OverdueReminderService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map