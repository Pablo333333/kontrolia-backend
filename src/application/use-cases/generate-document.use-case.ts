import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class GenerateDocumentUseCase {
  constructor(
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(ticketId: string): Promise<Buffer> {
    const ticket = await this.ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const team = await this.prisma.teamSettings.findFirst();

    const templatePath = join(__dirname, '..', '..', 'infrastructure', 'documents', 'templates', 'ticket-report.hbs');
    const templateSource = readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    const data = {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      categoryName: ticket.categoryName,
      statusName: ticket.statusName,
      priority: (ticket as any).priority || 'BAJA',
      latitude: ticket.latitude,
      longitude: ticket.longitude,
      locationLabel: (ticket as any).locationLabel,
      hasLocation: !!((ticket as any).locationLabel || (ticket.latitude && ticket.longitude)),
      currentDate: new Date().toLocaleString('es-PE'),
      userName: (ticket as any).remitenteName || 'Sistema',
      organizationName: team?.displayName || 'CONECTA',
      groupIdentifier: team?.groupIdentifier || 'GRUPO-001',
      logoUrl: team?.logoUrl,
      primaryColor: team?.primaryColor || '#2563eb',
    };

    const html = template(data);

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }
}
