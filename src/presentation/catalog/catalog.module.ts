import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { DocumentExportService } from '../../infrastructure/documents/document-export.service';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [DocumentExportService],
  exports: [DocumentExportService],
})
export class CatalogModule {}
