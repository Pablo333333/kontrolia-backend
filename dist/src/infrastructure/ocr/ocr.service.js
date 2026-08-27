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
var OcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const Tesseract = __importStar(require("tesseract.js"));
const path_1 = require("path");
const fs_1 = require("fs");
let OcrService = OcrService_1 = class OcrService {
    logger = new common_1.Logger(OcrService_1.name);
    async extractText(filePath) {
        const absolutePath = filePath.startsWith('/') || filePath.includes(':')
            ? filePath
            : (0, path_1.join)(process.cwd(), filePath);
        if (!(0, fs_1.existsSync)(absolutePath)) {
            this.logger.error(`Archivo no encontrado para OCR: ${absolutePath}`);
            return '';
        }
        try {
            this.logger.log(`Iniciando OCR para: ${absolutePath}`);
            const { data: { text } } = await Tesseract.recognize(absolutePath, 'spa', { logger: m => this.logger.debug(m) });
            this.logger.log(`OCR completado con éxito.`);
            return text;
        }
        catch (error) {
            this.logger.error(`Error durante el proceso de OCR: ${error.message}`);
            return '';
        }
    }
    async extractTextFromUrl(url) {
        try {
            this.logger.log(`Iniciando OCR remoto para: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                this.logger.error(`No se pudo descargar archivo para OCR: ${response.status}`);
                return '';
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            const { data: { text } } = await Tesseract.recognize(buffer, 'spa', {
                logger: m => this.logger.debug(m),
            });
            return text;
        }
        catch (error) {
            this.logger.error(`Error durante OCR remoto: ${error.message}`);
            return '';
        }
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = OcrService_1 = __decorate([
    (0, common_1.Injectable)()
], OcrService);
//# sourceMappingURL=ocr.service.js.map