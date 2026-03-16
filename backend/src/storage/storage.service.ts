// ============================================
// Storage Service — Hardened File Upload
// Path traversal protection, magic byte validation,
// malware scan queueing, presigned download URLs
// ============================================
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import * as crypto from 'crypto';
import * as path from 'path';

// ---- Allowed MIME types (strict whitelist) ----
const ALLOWED_MIME_TYPES = new Set([
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    // Documents
    'application/pdf', 'text/plain', 'application/json',
    // Archives (for PoC bundles)
    'application/zip',
    // Videos (for PoC demos)
    'video/mp4', 'video/webm',
]);

// Dangerous extensions that should NEVER be accepted
const BLOCKED_EXTENSIONS = new Set([
    '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif', '.vbs',
    '.js', '.ws', '.wsf', '.wsc', '.wsh', '.ps1', '.psm1', '.psd1',
    '.sh', '.bash', '.csh', '.ksh', '.php', '.php3', '.php4', '.php5',
    '.phtml', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.cgi',
    '.dll', '.sys', '.drv', '.inf', '.reg', '.hta', '.jar', '.class',
]);

// Magic byte signatures for content-type validation
const MAGIC_BYTES: Record<string, string[]> = {
    'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffdb', 'ffd8ffee'],
    'image/png': ['89504e47'],
    'image/gif': ['47494638'],
    'image/webp': ['52494646'],
    'application/pdf': ['25504446'],
    'application/zip': ['504b0304', '504b0506', '504b0708'],
    'video/mp4': ['00000018', '0000001c', '00000020'],
};

// Max file sizes per category (in bytes)
const MAX_FILE_SIZES: Record<string, number> = {
    image: 10 * 1024 * 1024,      // 10 MB
    document: 25 * 1024 * 1024,    // 25 MB
    archive: 50 * 1024 * 1024,     // 50 MB
    video: 100 * 1024 * 1024,      // 100 MB
    default: 25 * 1024 * 1024,     // 25 MB
};

export interface UploadOptions {
    file: Express.Multer.File;
    folder?: string;
    resize?: { width: number; height: number };
}

export interface UploadResult {
    key: string;
    originalName: string;
    sanitizedName: string;
    size: number;
    mimeType: string;
    scanStatus: 'queued' | 'skipped';
}

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private s3Client: S3Client;
    private bucketName: string;

    constructor(
        private configService: ConfigService,
        @InjectQueue('malware-scan') private malwareScanQueue: Queue,
    ) {
        this.s3Client = new S3Client({
            region: this.configService.get('AWS_REGION') || 'us-east-1',
            endpoint: this.configService.get('S3_ENDPOINT'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
            },
            forcePathStyle: true,
        });

        this.bucketName = this.configService.get('S3_BUCKET_NAME') || 'bugify-uploads';
    }

    /**
     * Upload a file with full security validation.
     */
    async uploadFile(options: UploadOptions): Promise<UploadResult> {
        const { file, folder = 'general', resize } = options;

        // 1. Validate everything
        this.validateFile(file);

        // 2. Sanitize filename (prevent path traversal)
        const sanitizedName = this.sanitizeFilename(file.originalname);
        const fileExtension = path.extname(sanitizedName).toLowerCase();
        const uniqueName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const key = `${folder}/${uniqueName}`;

        // 3. Process buffer
        let buffer = file.buffer;
        if (resize && this.isImage(file.mimetype)) {
            buffer = await sharp(file.buffer)
                .resize(resize.width, resize.height, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toBuffer();
        }

        // 4. Upload to S3/MinIO with metadata
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: file.mimetype,
            ContentDisposition: `attachment; filename="${sanitizedName}"`,
            Metadata: {
                'original-name': sanitizedName,
                'upload-timestamp': new Date().toISOString(),
                'scan-status': 'pending',
            },
        });

        await this.s3Client.send(command);

        // 5. Queue malware scan (async, non-blocking)
        let scanStatus: 'queued' | 'skipped' = 'skipped';
        try {
            await this.malwareScanQueue.add('scan-file', {
                key,
                bucketName: this.bucketName,
                originalName: sanitizedName,
                mimeType: file.mimetype,
                size: file.size,
            }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: 100,
                removeOnFail: 50,
            });
            scanStatus = 'queued';
        } catch (err) {
            this.logger.warn(`Failed to queue malware scan for ${key}: ${err}`);
        }

        this.logger.log(`File uploaded: ${key} (${file.size} bytes, scan: ${scanStatus})`);

        return {
            key,
            originalName: file.originalname,
            sanitizedName,
            size: buffer.length,
            mimeType: file.mimetype,
            scanStatus,
        };
    }

    /**
     * Get a presigned download URL (short-lived, content-disposition: attachment).
     */
    async getSignedUrl(key: string, expiresIn: number = 900): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ResponseContentDisposition: 'attachment',
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    /**
     * Delete a file from S3/MinIO.
     */
    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.s3Client.send(command);
    }

    // ---- Convenience Methods ----

    async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<UploadResult> {
        if (!this.isImage(file.mimetype)) {
            throw new BadRequestException('Profile pictures must be images');
        }
        return this.uploadFile({
            file,
            folder: `profiles/${userId}`,
            resize: { width: 400, height: 400 },
        });
    }

    async uploadReportAttachment(file: Express.Multer.File, reportId: string): Promise<UploadResult> {
        return this.uploadFile({
            file,
            folder: `reports/${reportId}`,
        });
    }

    async uploadKycDocument(file: Express.Multer.File, userId: string): Promise<UploadResult> {
        return this.uploadFile({
            file,
            folder: `kyc/${userId}`,
        });
    }

    // ---- Validation ----

    private validateFile(file: Express.Multer.File): void {
        // Check MIME type whitelist
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            throw new BadRequestException(`File type '${file.mimetype}' is not allowed`);
        }

        // Check for blocked extensions (double-extension attack: "payload.pdf.exe")
        const ext = path.extname(file.originalname).toLowerCase();
        if (BLOCKED_EXTENSIONS.has(ext)) {
            throw new BadRequestException(`File extension '${ext}' is not allowed`);
        }

        // Check for double extensions
        const allExtensions = file.originalname.match(/\.[a-zA-Z0-9]+/g) || [];
        for (const extension of allExtensions) {
            if (BLOCKED_EXTENSIONS.has(extension.toLowerCase())) {
                throw new BadRequestException(`Blocked extension '${extension}' detected in filename`);
            }
        }

        // Category-based size limits
        const category = this.getFileCategory(file.mimetype);
        const maxSize = MAX_FILE_SIZES[category] || MAX_FILE_SIZES.default;
        if (file.size > maxSize) {
            throw new BadRequestException(
                `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds ${category} limit of ${maxSize / 1024 / 1024}MB`,
            );
        }

        // Validate magic bytes (content-type spoofing defense)
        this.validateMagicBytes(file);
    }

    private validateMagicBytes(file: Express.Multer.File): void {
        if (!file.buffer || file.buffer.length < 4) {
            throw new BadRequestException('File is empty or too small');
        }

        const magicHex = file.buffer.subarray(0, 8).toString('hex');
        const expectedMagic = MAGIC_BYTES[file.mimetype];

        if (expectedMagic) {
            const isValid = expectedMagic.some(magic => magicHex.startsWith(magic));
            if (!isValid) {
                this.logger.warn(
                    `Magic byte mismatch: claimed=${file.mimetype}, bytes=${magicHex.substring(0, 16)}, file=${file.originalname}`,
                );
                throw new BadRequestException('File content does not match declared file type');
            }
        }
    }

    /**
     * Sanitize filename to prevent path traversal and encoding attacks.
     */
    private sanitizeFilename(originalName: string): string {
        // Strip path components (prevent ../ attacks)
        let sanitized = path.basename(originalName);

        // Remove null bytes
        sanitized = sanitized.replace(/\x00/g, '');

        // Strip non-ASCII and special chars, keep alphanumeric, dots, hyphens, underscores
        sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

        // Prevent leading dots (hidden files)
        sanitized = sanitized.replace(/^\.+/, '');

        // Collapse runs of underscores
        sanitized = sanitized.replace(/_+/g, '_');

        // Truncate to reasonable length
        if (sanitized.length > 200) {
            const ext = path.extname(sanitized);
            sanitized = sanitized.substring(0, 200 - ext.length) + ext;
        }

        return sanitized || 'unnamed_file';
    }

    private isImage(mimetype: string): boolean {
        return mimetype.startsWith('image/');
    }

    private getFileCategory(mimetype: string): string {
        if (mimetype.startsWith('image/')) return 'image';
        if (mimetype.startsWith('video/')) return 'video';
        if (mimetype === 'application/zip') return 'archive';
        return 'document';
    }
}
