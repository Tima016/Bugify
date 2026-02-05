import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import * as crypto from 'crypto';
import * as path from 'path';

export interface UploadOptions {
    file: Express.Multer.File;
    folder?: string;
    resize?: { width: number; height: number };
}

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        // Initialize S3 client (works with both AWS S3 and MinIO)
        this.s3Client = new S3Client({
            region: this.configService.get('AWS_REGION') || 'us-east-1',
            endpoint: this.configService.get('S3_ENDPOINT'), // For MinIO
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
            },
            forcePathStyle: true, // Required for MinIO
        });

        this.bucketName = this.configService.get('S3_BUCKET_NAME') || 'uzsecure-uploads';
    }

    /**
     * Upload a file to S3/MinIO
     */
    async uploadFile(options: UploadOptions): Promise<string> {
        const { file, folder = 'general', resize } = options;

        // Validate file
        this.validateFile(file);

        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const key = folder ? `${folder}/${fileName}` : fileName;

        let buffer = file.buffer;

        // Resize image if needed
        if (resize && this.isImage(file.mimetype)) {
            buffer = await sharp(file.buffer)
                .resize(resize.width, resize.height, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toBuffer();
        }

        // Upload to S3/MinIO
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: file.mimetype,
            Metadata: {
                originalName: file.originalname,
            },
        });

        await this.s3Client.send(command);

        return key;
    }

    /**
     * Get a signed URL for temporary file access
     */
    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    /**
     * Delete a file from S3/MinIO
     */
    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        await this.s3Client.send(command);
    }

    /**
     * Validate file size and type
     */
    private validateFile(file: Express.Multer.File): void {
        const maxSize = this.configService.get('MAX_FILE_SIZE') || 52428800; // 50MB default

        if (file.size > maxSize) {
            throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
        }

        // Allowed MIME types
        const allowedTypes = [
            // Images
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            // Documents
            'application/pdf',
            'text/plain',
            'application/json',
            // Archives
            'application/zip',
            'application/x-rar-compressed',
            // Videos (for PoC)
            'video/mp4',
            'video/webm',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`File type ${file.mimetype} is not allowed`);
        }

        // Validate magic bytes (basic security check)
        this.validateMagicBytes(file);
    }

    /**
     * Validate file magic bytes to prevent file type spoofing
     */
    private validateMagicBytes(file: Express.Multer.File): void {
        const buffer = file.buffer;
        const magicBytes = buffer.slice(0, 4).toString('hex');

        const validMagicBytes: Record<string, string[]> = {
            'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
            'image/png': ['89504e47'],
            'image/gif': ['47494638'],
            'application/pdf': ['25504446'],
            'application/zip': ['504b0304', '504b0506', '504b0708'],
        };

        const expectedMagicBytes = validMagicBytes[file.mimetype];
        if (expectedMagicBytes) {
            const isValid = expectedMagicBytes.some(magic => magicBytes.startsWith(magic));
            if (!isValid) {
                throw new Error('File content does not match declared file type');
            }
        }
    }

    /**
     * Check if file is an image
     */
    private isImage(mimetype: string): boolean {
        return mimetype.startsWith('image/');
    }

    /**
     * Upload profile picture
     */
    async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string> {
        return await this.uploadFile({
            file,
            folder: `profiles/${userId}`,
            resize: { width: 400, height: 400 },
        });
    }

    /**
     * Upload report attachment
     */
    async uploadReportAttachment(file: Express.Multer.File, reportId: string): Promise<string> {
        return await this.uploadFile({
            file,
            folder: `reports/${reportId}`,
        });
    }

    /**
     * Upload KYC document
     */
    async uploadKycDocument(file: Express.Multer.File, userId: string): Promise<string> {
        return await this.uploadFile({
            file,
            folder: `kyc/${userId}`,
        });
    }
}
