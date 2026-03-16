import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
export interface UploadOptions {
    file: Express.Multer.File;
    folder?: string;
    resize?: {
        width: number;
        height: number;
    };
}
export interface UploadResult {
    key: string;
    originalName: string;
    sanitizedName: string;
    size: number;
    mimeType: string;
    scanStatus: 'queued' | 'skipped';
}
export declare class StorageService {
    private configService;
    private malwareScanQueue;
    private readonly logger;
    private s3Client;
    private bucketName;
    constructor(configService: ConfigService, malwareScanQueue: Queue);
    uploadFile(options: UploadOptions): Promise<UploadResult>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
    uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<UploadResult>;
    uploadReportAttachment(file: Express.Multer.File, reportId: string): Promise<UploadResult>;
    uploadKycDocument(file: Express.Multer.File, userId: string): Promise<UploadResult>;
    private validateFile;
    private validateMagicBytes;
    private sanitizeFilename;
    private isImage;
    private getFileCategory;
}
