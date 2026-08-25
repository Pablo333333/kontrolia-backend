import { Controller, Post, Body, UseGuards, Patch, Param, Get, Query, UseInterceptors, UploadedFile, Res, Inject, InternalServerErrorException } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTicketUseCase } from '../../application/use-cases/create-ticket.use-case';
import { ChangeTicketStateUseCase } from '../../application/use-cases/change-ticket-state.use-case';
import { OpenTicketUseCase } from '../../application/use-cases/open-ticket.use-case';
import { CloseTicketUseCase } from '../../application/use-cases/close-ticket.use-case';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.use-case';
import { GetTicketDocumentsUseCase } from '../../application/use-cases/get-ticket-documents.use-case';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { GetTicketCommentsUseCase } from '../../application/use-cases/get-ticket-comments.use-case';
import { GenerateDocumentUseCase } from '../../application/use-cases/generate-document.use-case';
import { SummarizeTicketConversationUseCase } from '../../application/use-cases/summarize-ticket-conversation.use-case';
import { DraftSmartDocumentUseCase } from '../../application/use-cases/draft-smart-document.use-case';
import { SaveSmartDocumentUseCase } from '../../application/use-cases/save-smart-document.use-case';
import { DraftSmartDocumentDto, SaveSmartDocumentDto } from '../../application/dtos/smart-document.dto';
import { CreateTicketDto } from '../../application/dtos/create-ticket.dto';
import { ChangeTicketStatusDto } from '../../application/dtos/change-ticket-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OcrService } from '../../infrastructure/ocr/ocr.service';
import { PredictiveService } from '../../infrastructure/predictive/predictive.service';
import { CloudinaryService } from '../../infrastructure/documents/cloudinary.service';
import { SemanticSearchService } from '../../infrastructure/search/semantic-search.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly changeTicketStateUseCase: ChangeTicketStateUseCase,
    private readonly openTicketUseCase: OpenTicketUseCase,
    private readonly closeTicketUseCase: CloseTicketUseCase,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly getTicketDocumentsUseCase: GetTicketDocumentsUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly getTicketCommentsUseCase: GetTicketCommentsUseCase,
    private readonly generateDocumentUseCase: GenerateDocumentUseCase,
    private readonly draftSmartDocumentUseCase: DraftSmartDocumentUseCase,
    private readonly saveSmartDocumentUseCase: SaveSmartDocumentUseCase,
    private readonly summarizeTicketConversationUseCase: SummarizeTicketConversationUseCase,
    private readonly prisma: PrismaService,
    private readonly ocrService: OcrService,
    private readonly predictiveService: PredictiveService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly semanticSearchService: SemanticSearchService,
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    @Inject(ITicketHistoryRepository)
    private readonly ticketHistoryRepository: ITicketHistoryRepository,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERARIO)
  @UseInterceptors(FileInterceptor('audio', {
    storage: new CloudinaryService().getStorage('tickets/audio'),
  }))
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser() user: { userId: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (file) {
        console.log(`[Cloudinary] Archivo subido exitosamente: ${file.path}`);
      }
      return await this.createTicketUseCase.execute(createTicketDto, user.userId, file);
    } catch (error) {
      console.error('[Cloudinary Error] Fallo en la subida:', error);
      throw new InternalServerErrorException('El servicio de almacenamiento no está disponible');
    }
  }

  @Post('smart-document/draft')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERARIO)
  async draftSmartDocument(@Body() dto: DraftSmartDocumentDto) {
    return this.draftSmartDocumentUseCase.execute(dto);
  }

  @Post(':id/smart-document/save')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERARIO)
  async saveSmartDocument(
    @Param('id') id: string,
    @Body() dto: SaveSmartDocumentDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.saveSmartDocumentUseCase.execute(id, dto, user.userId);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeTicketStatusDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.changeTicketStateUseCase.execute(id, dto.newStateId, user.userId);
  }

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('workflowStateId') workflowStateId?: string,
    @Query('priority') priority?: string,
    @Query('messageType') messageType?: string,
    @Query('userId') userId?: string,
    @Query('destinatarioId') destinatarioId?: string,
    @Query('q') q?: string,
    @Query('includeArchived') includeArchived?: string,
    @Query('includeDocuments') includeDocuments?: string,
    @Query('includeLastResponse') includeLastResponse?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.ticketRepository.findAll({
      categoryId,
      subcategoryId,
      workflowStateId,
      priority,
      messageType,
      userId,
      destinatarioId,
      q,
      includeArchived: includeArchived === 'true',
      includeDocuments: includeDocuments === 'true',
      includeLastResponse: includeLastResponse !== 'false',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Post(':id/open')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERARIO)
  async open(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.openTicketUseCase.execute(id, user.userId);
  }

  @Post(':id/close')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERARIO)
  async close(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.closeTicketUseCase.execute(id, user.userId);
  }

  @Get('stats')
  async getStats() {
    return this.ticketRepository.getStats();
  }

  @Get('search')
  async search(
    @Query('q') q?: string,
    @Query('mode') mode?: string,
    @Query('includeArchived') includeArchived?: string,
    @Query('limit') limit?: string,
  ) {
    const query = (q || '').trim();
    if (!query) return [];

    if ((mode || 'semantic') === 'literal') {
      return this.ticketRepository.findAll({
        q: query,
        includeArchived: includeArchived === 'true',
        limit: limit ? Number(limit) : 50,
      });
    }

    return this.semanticSearchService.search(query, {
      includeArchived: includeArchived === 'true',
      limit: limit ? Number(limit) : 50,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketRepository.findById(id);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return this.ticketHistoryRepository.findByTicketId(id);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', new CloudinaryService().getUploadOptions('tickets/documents')))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      console.log(`[Cloudinary] Archivo subido exitosamente: ${file.path}`);
      
      const existingDoc = await this.prisma.document.findFirst({
        where: {
          ticketId: id,
          name: file.originalname,
          isLatest: true,
        },
      });

      let version = 1;
      if (existingDoc) {
        version = existingDoc.version + 1;
        await this.prisma.document.update({
          where: { id: existingDoc.id },
          data: { isLatest: false },
        });
      }

      let extractedText: string | undefined;
      if (file.mimetype?.startsWith('image/')) {
        extractedText = await this.ocrService.extractTextFromUrl(file.path);
        if (!extractedText?.trim()) {
          extractedText = undefined;
        }
      }

      return this.uploadDocumentUseCase.execute({
        name: file.originalname,
        url: file.path,
        type: file.mimetype,
        userId: user.userId,
        ticketId: id,
        version,
        isLatest: true,
        extractedText,
      } as any);
    } catch (error) {
      console.error('[Cloudinary Error] Fallo en la subida:', error);
      throw new InternalServerErrorException('El servicio de almacenamiento no está disponible');
    }
  }

  @Get(':id/documents')
  async getDocuments(@Param('id') id: string) {
    return this.getTicketDocumentsUseCase.execute(id);
  }

  @Post(':id/comments')
  async createComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.createCommentUseCase.execute({
      content,
      userId: user.userId,
      ticketId: id,
    });
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.getTicketCommentsUseCase.execute(id);
  }

  @Post(':id/summarize')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERARIO)
  async summarize(@Param('id') id: string) {
    return { summary: await this.summarizeTicketConversationUseCase.execute(id) };
  }

  @Get(':id/generate-pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.generateDocumentUseCase.execute(id);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Post('analyze-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: new CloudinaryService().getStorage('temp/ocr'),
  }))
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    try {
      const text = await this.ocrService.extractText(file.path);
      if (!text) return { error: 'No se pudo extraer texto de la imagen' };
      
      const suggestions = await this.predictiveService.analyzeDocumentText(text);
      return { ...suggestions, extractedText: text };
    } catch (error) {
      console.error('[Cloudinary Error] Fallo en la subida:', error);
      throw new InternalServerErrorException('El servicio de almacenamiento no está disponible');
    }
  }
}
