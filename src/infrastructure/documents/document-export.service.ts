import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';

export type DocumentListItem = {
  id: string;
  name: string;
  url: string;
  type?: string | null;
  version: number;
  isLatest: boolean;
  createdAt: Date;
  folderId?: string | null;
  folderName?: string | null;
  ticketId?: string | null;
  ticketTitle?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
};

@Injectable()
export class DocumentExportService {
  constructor(private readonly prisma: PrismaService) {}

  async listDocuments(filters: {
    q?: string;
    categoryId?: string;
    folderId?: string;
    limit?: number;
  }): Promise<DocumentListItem[]> {
    const where: any = { isLatest: true };
    if (filters.folderId) where.folderId = filters.folderId;
    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { extractedText: { contains: filters.q, mode: 'insensitive' } },
        { ticket: { title: { contains: filters.q, mode: 'insensitive' } } },
      ];
    }
    if (filters.categoryId) {
      where.ticket = { ...(where.ticket || {}), categoryId: filters.categoryId };
    }

    const docs = await this.prisma.document.findMany({
      where,
      take: Math.min(filters.limit ?? 200, 500),
      orderBy: { createdAt: 'desc' },
      include: {
        folder: { select: { id: true, name: true } },
        ticket: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    return docs.map(d => ({
      id: d.id,
      name: d.name,
      url: d.url,
      type: d.type,
      version: d.version,
      isLatest: d.isLatest,
      createdAt: d.createdAt,
      folderId: d.folderId,
      folderName: d.folder?.name ?? null,
      ticketId: d.ticketId,
      ticketTitle: d.ticket?.title ?? null,
      categoryId: d.ticket?.categoryId ?? null,
      categoryName: d.ticket?.category?.name ?? null,
    }));
  }

  async export(options: {
    format: 'csv' | 'pdf';
    q?: string;
    categoryId?: string;
    folderId?: string;
  }): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    const docs = await this.listDocuments({
      q: options.q,
      categoryId: options.categoryId,
      folderId: options.folderId,
      limit: 500,
    });

    if (options.format === 'csv') {
      const header = 'Nombre,Ticket,Categoria,Carpeta,Version,Fecha,URL\n';
      const rows = docs
        .map(d =>
          [
            this.csvEscape(d.name),
            this.csvEscape(d.ticketTitle || ''),
            this.csvEscape(d.categoryName || ''),
            this.csvEscape(d.folderName || ''),
            d.version,
            new Date(d.createdAt).toISOString().slice(0, 10),
            this.csvEscape(d.url),
          ].join(','),
        )
        .join('\n');

      return {
        buffer: Buffer.from(header + rows, 'utf-8'),
        contentType: 'text/csv; charset=utf-8',
        filename: `kontrolia-documentos-${Date.now()}.csv`,
      };
    }

    const template = Handlebars.compile(`
      <html><head><meta charset="utf-8"/><style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111}
        h1{font-size:20px;margin-bottom:4px}
        p{color:#555;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:16px;font-size:11px}
        th,td{border:1px solid #ddd;padding:6px;text-align:left}
        th{background:#f3f4f6}
      </style></head><body>
        <h1>Repositorio consolidado — KONTROLIA</h1>
        <p>Generado: {{generatedAt}} · {{count}} documento(s)</p>
        <table>
          <thead><tr><th>Nombre</th><th>Ticket</th><th>Categoría</th><th>Carpeta</th><th>Fecha</th></tr></thead>
          <tbody>
            {{#each docs}}
              <tr>
                <td>{{name}}</td>
                <td>{{ticketTitle}}</td>
                <td>{{categoryName}}</td>
                <td>{{folderName}}</td>
                <td>{{date}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </body></html>
    `);

    const html = template({
      generatedAt: new Date().toLocaleString('es-PE'),
      count: docs.length,
      docs: docs.map(d => ({
        name: d.name,
        ticketTitle: d.ticketTitle || '—',
        categoryName: d.categoryName || '—',
        folderName: d.folderName || '—',
        date: new Date(d.createdAt).toLocaleDateString('es-PE'),
      })),
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return {
        buffer: Buffer.from(pdf),
        contentType: 'application/pdf',
        filename: `kontrolia-documentos-${Date.now()}.pdf`,
      };
    } finally {
      await browser.close();
    }
  }

  private csvEscape(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
