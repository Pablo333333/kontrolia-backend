import { Module } from '@nestjs/common';
import { WorkGroupsController } from './work-groups.controller';
import { WorkGroupService } from '../../application/use-cases/work-group.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { NotificationModule } from '../../infrastructure/notifications/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [WorkGroupsController],
  providers: [WorkGroupService],
  exports: [WorkGroupService],
})
export class WorkGroupsModule {}
