"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const Handlebars = __importStar(require("handlebars"));
const puppeteer = __importStar(require("puppeteer"));
let DocumentExportService = class DocumentExportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listDocuments(filters) {
        const where = { isLatest: true };
        if (filters.folderId)
            where.folderId = filters.folderId;
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
    async export(options) {
        const docs = await this.listDocuments({
            q: options.q,
            categoryId: options.categoryId,
            folderId: options.folderId,
            limit: 500,
        });
        if (options.format === 'csv') {
            const header = 'Nombre,Ticket,Categoria,Carpeta,Version,Fecha,URL\n';
            const rows = docs
                .map(d => [
                this.csvEscape(d.name),
                this.csvEscape(d.ticketTitle || ''),
                this.csvEscape(d.categoryName || ''),
                this.csvEscape(d.folderName || ''),
                d.version,
                new Date(d.createdAt).toISOString().slice(0, 10),
                this.csvEscape(d.url),
            ].join(','))
                .join('\n');
            return {
                buffer: Buffer.from(header + rows, 'utf-8'),
                contentType: 'text/csv; charset=utf-8',
                filename: `conecta-documentos-${Date.now()}.csv`,
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
        <h1>Repositorio consolidado — CONECTA</h1>
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
                filename: `conecta-documentos-${Date.now()}.pdf`,
            };
        }
        finally {
            await browser.close();
        }
    }
    csvEscape(value) {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
};
exports.DocumentExportService = DocumentExportService;
exports.DocumentExportService = DocumentExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentExportService);
//# sourceMappingURL=document-export.service.js.map