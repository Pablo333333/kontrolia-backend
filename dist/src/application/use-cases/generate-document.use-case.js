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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateDocumentUseCase = void 0;
const common_1 = require("@nestjs/common");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const handlebars = __importStar(require("handlebars"));
const puppeteer = __importStar(require("puppeteer"));
const fs_1 = require("fs");
const path_1 = require("path");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let GenerateDocumentUseCase = class GenerateDocumentUseCase {
    ticketRepository;
    prisma;
    constructor(ticketRepository, prisma) {
        this.ticketRepository = ticketRepository;
        this.prisma = prisma;
    }
    async execute(ticketId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const team = await this.prisma.teamSettings.findFirst();
        const templatePath = (0, path_1.join)(__dirname, '..', '..', 'infrastructure', 'documents', 'templates', 'ticket-report.hbs');
        const templateSource = (0, fs_1.readFileSync)(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);
        const data = {
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            categoryName: ticket.categoryName,
            statusName: ticket.statusName,
            priority: ticket.priority || 'BAJA',
            latitude: ticket.latitude,
            longitude: ticket.longitude,
            locationLabel: ticket.locationLabel,
            hasLocation: !!(ticket.locationLabel || (ticket.latitude && ticket.longitude)),
            currentDate: new Date().toLocaleString('es-PE'),
            userName: ticket.remitenteName || 'Sistema',
            organizationName: team?.displayName || 'CONECTA',
            groupIdentifier: team?.groupIdentifier || 'GRUPO-001',
            logoUrl: team?.logoUrl,
            primaryColor: team?.primaryColor || '#2563eb',
        };
        const html = template(data);
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
};
exports.GenerateDocumentUseCase = GenerateDocumentUseCase;
exports.GenerateDocumentUseCase = GenerateDocumentUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.ITicketRepository)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], GenerateDocumentUseCase);
//# sourceMappingURL=generate-document.use-case.js.map