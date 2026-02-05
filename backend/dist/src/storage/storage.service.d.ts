import { ConfigService } from '@nestjs/config';
export interface UploadOptions {
    file: Express.Multer.File;
    folder?: string;
    resize?: {
        width: number;
        height: number;
    };
}
export declare class StorageService {
    private configService;
    private s3Client;
    private bucketName;
    constructor(configService: ConfigService);
    uploadFile(options: UploadOptions): Promise<string>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
    private validateFile;
    private validateMagicBytes;
    private isImage;
    uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string>;
    uploadReportAttachment(file: Express.Multer.File, reportId: string): Promise<string>;
    uploadKycDocument(file: Express.Multer.File, userId: string): Promise<string>;
}
