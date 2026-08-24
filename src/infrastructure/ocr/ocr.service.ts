import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async extractText(filePath: string): Promise<string> {
    const absolutePath = filePath.startsWith('/') || filePath.includes(':') 
      ? filePath 
      : join(process.cwd(), filePath);

    if (!existsSync(absolutePath)) {
      this.logger.error(`Archivo no encontrado para OCR: ${absolutePath}`);
      return '';
    }

    try {
      this.logger.log(`Iniciando OCR para: ${absolutePath}`);
      const { data: { text } } = await Tesseract.recognize(
        absolutePath,
        'spa',
        { logger: m => this.logger.debug(m) }
      );
      this.logger.log(`OCR completado con éxito.`);
      return text;
    } catch (error) {
      this.logger.error(`Error durante el proceso de OCR: ${error.message}`);
      return '';
    }
  }

  async extractTextFromUrl(url: string): Promise<string> {
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
    } catch (error) {
      this.logger.error(`Error durante OCR remoto: ${error.message}`);
      return '';
    }
  }
}
