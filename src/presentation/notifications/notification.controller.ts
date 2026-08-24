import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { OverdueReminderService } from '../../infrastructure/notifications/overdue-reminder.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly overdueReminderService: OverdueReminderService,
  ) {}

  @Post('register-token')
  async registerToken(@Request() req: any, @Body('token') token: string) {
    await this.notificationService.registerToken(req.user.userId, token);
    return { success: true, message: 'Push token registered successfully' };
  }

  @Get('report')
  async getReport() {
    return this.overdueReminderService.checkOverdueAndPending();
  }
}
