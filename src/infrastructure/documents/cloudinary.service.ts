import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import type { Options as MulterOptions } from 'multer';

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB (incluye video)

const ALLOWED_PREFIXES = [
  'image/',
  'video/',
  'audio/',
  'application/pdf',
  'application/msword',
  'application/vnd.',
  'text/',
];

@Injectable()
export class CloudinaryService {
  constructor() {
    if (process.env.CLOUDINARY_URL) {
      const url = process.env.CLOUDINARY_URL;
      const regex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
      const matches = url.match(regex);
      if (matches) {
        cloudinary.config({
          cloud_name: matches[3],
          api_key: matches[1],
          api_secret: matches[2],
        });
      }
    }
  }

  getStorage(folder: string = 'conecta') {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        // @ts-ignore
        folder: folder,
        resource_type: 'auto',
        public_id: (_req, _file) => {
          const randomName = Array(16)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return `${Date.now()}-${randomName}`;
        },
      },
    });
  }

  /** Multer options con límite de tamaño y tipos permitidos (incl. video). */
  getUploadOptions(folder: string = 'conecta'): MulterOptions {
    return {
      storage: this.getStorage(folder),
      limits: { fileSize: MAX_FILE_BYTES },
      fileFilter: (_req, file, cb) => {
        const mime = (file.mimetype || '').toLowerCase();
        const ok = ALLOWED_PREFIXES.some((p) => mime.startsWith(p) || mime === p);
        if (!ok) {
          return cb(
            new BadRequestException(`Tipo de archivo no permitido: ${mime}`) as any,
            false,
          );
        }
        cb(null, true);
      },
    };
  }
}
