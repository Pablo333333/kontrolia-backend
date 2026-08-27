import { CloudinaryStorage } from 'multer-storage-cloudinary';
import type { Options as MulterOptions } from 'multer';
export declare class CloudinaryService {
    constructor();
    getStorage(folder?: string): CloudinaryStorage;
    getUploadOptions(folder?: string): MulterOptions;
}
