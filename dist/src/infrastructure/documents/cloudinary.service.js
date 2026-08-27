"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ALLOWED_PREFIXES = [
    'image/',
    'video/',
    'audio/',
    'application/pdf',
    'application/msword',
    'application/vnd.',
    'text/',
];
let CloudinaryService = class CloudinaryService {
    constructor() {
        if (process.env.CLOUDINARY_URL) {
            const url = process.env.CLOUDINARY_URL;
            const regex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
            const matches = url.match(regex);
            if (matches) {
                cloudinary_1.v2.config({
                    cloud_name: matches[3],
                    api_key: matches[1],
                    api_secret: matches[2],
                });
            }
        }
    }
    getStorage(folder = 'conecta') {
        return new multer_storage_cloudinary_1.CloudinaryStorage({
            cloudinary: cloudinary_1.v2,
            params: {
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
    getUploadOptions(folder = 'conecta') {
        return {
            storage: this.getStorage(folder),
            limits: { fileSize: MAX_FILE_BYTES },
            fileFilter: (_req, file, cb) => {
                const mime = (file.mimetype || '').toLowerCase();
                const ok = ALLOWED_PREFIXES.some((p) => mime.startsWith(p) || mime === p);
                if (!ok) {
                    return cb(new common_1.BadRequestException(`Tipo de archivo no permitido: ${mime}`), false);
                }
                cb(null, true);
            },
        };
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map