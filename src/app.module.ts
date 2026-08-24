import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './presentation/tickets/tickets.module';
import { AuthModule } from './presentation/auth/auth.module';
import { CatalogModule } from './presentation/catalog/catalog.module';
import { AuditPresentationModule } from './presentation/audit/audit.module';
import { SocketModule } from './infrastructure/socket/socket.module';
import { NotificationModule } from './infrastructure/notifications/notification.module';
import { WorkGroupsModule } from './presentation/work-groups/work-groups.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TicketsModule,
    CatalogModule,
    AuditPresentationModule,
    SocketModule,
    NotificationModule,
    WorkGroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
