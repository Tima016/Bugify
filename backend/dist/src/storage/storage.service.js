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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const sharp_1 = __importDefault(require("sharp"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/json',
    'application/zip',
    'video/mp4', 'video/webm',
]);
const BLOCKED_EXTENSIONS = new Set([
    '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif', '.vbs',
    '.js', '.ws', '.wsf', '.wsc', '.wsh', '.ps1', '.psm1', '.psd1',
    '.sh', '.bash', '.csh', '.ksh', '.php', '.php3', '.php4', '.php5',
    '.phtml', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.cgi',
    '.dll', '.sys', '.drv', '.inf', '.reg', '.hta', '.jar', '.class',
]);
const MAGIC_BYTES = {
    'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffdb', 'ffd8ffee'],
    'image/png': ['89504e47'],
    'image/gif': ['47494638'],
    'image/webp': ['52494646'],
    'application/pdf': ['25504446'],
    'application/zip': ['504b0304', '504b0506', '504b0708'],
    'video/mp4': ['00000018', '0000001c', '00000020'],
};
const MAX_FILE_SIZES = {
    image: 10 * 1024 * 1024,
    document: 25 * 1024 * 1024,
    archive: 50 * 1024 * 1024,
    video: 100 * 1024 * 1024,
    default: 25 * 1024 * 1024,
};
let StorageService = StorageService_1 = class StorageService {
    configService;
    malwareScanQueue;
    logger = new common_1.Logger(StorageService_1.name);
    s3Client;
    bucketName;
    constructor(configService, malwareScanQueue) {
        this.configService = configService;
        this.malwareScanQueue = malwareScanQueue;
        this.s3Client = new client_s3_1.S3Client({
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
    async uploadFile(options) {
        const { file, folder = 'general', resize } = options;
        this.validateFile(file);
        const sanitizedName = this.sanitizeFilename(file.originalname);
        const fileExtension = path.extname(sanitizedName).toLowerCase();
        const uniqueName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const key = `${folder}/${uniqueName}`;
        let buffer = file.buffer;
        if (resize && this.isImage(file.mimetype)) {
            buffer = await (0, sharp_1.default)(file.buffer)
                .resize(resize.width, resize.height, {
                fit: 'inside',
                withoutEnlargement: true,
            })
                .toBuffer();
        }
        const command = new client_s3_1.PutObjectCommand({
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
        let scanStatus = 'skipped';
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
        }
        catch (err) {
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
    async getSignedUrl(key, expiresIn = 900) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ResponseContentDisposition: 'attachment',
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    async deleteFile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.s3Client.send(command);
    }
    async uploadProfilePicture(file, userId) {
        if (!this.isImage(file.mimetype)) {
            throw new common_1.BadRequestException('Profile pictures must be images');
        }
        return this.uploadFile({
            file,
            folder: `profiles/${userId}`,
            resize: { width: 400, height: 400 },
        });
    }
    async uploadReportAttachment(file, reportId) {
        return this.uploadFile({
            file,
            folder: `reports/${reportId}`,
        });
    }
    async uploadKycDocument(file, userId) {
        return this.uploadFile({
            file,
            folder: `kyc/${userId}`,
        });
    }
    validateFile(file) {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException(`File type '${file.mimetype}' is not allowed`);
        }
        const ext = path.extname(file.originalname).toLowerCase();
        if (BLOCKED_EXTENSIONS.has(ext)) {
            throw new common_1.BadRequestException(`File extension '${ext}' is not allowed`);
        }
        const allExtensions = file.originalname.match(/\.[a-zA-Z0-9]+/g) || [];
        for (const extension of allExtensions) {
            if (BLOCKED_EXTENSIONS.has(extension.toLowerCase())) {
                throw new common_1.BadRequestException(`Blocked extension '${extension}' detected in filename`);
            }
        }
        const category = this.getFileCategory(file.mimetype);
        const maxSize = MAX_FILE_SIZES[category] || MAX_FILE_SIZES.default;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds ${category} limit of ${maxSize / 1024 / 1024}MB`);
        }
        this.validateMagicBytes(file);
    }
    validateMagicBytes(file) {
        if (!file.buffer || file.buffer.length < 4) {
            throw new common_1.BadRequestException('File is empty or too small');
        }
        const magicHex = file.buffer.subarray(0, 8).toString('hex');
        const expectedMagic = MAGIC_BYTES[file.mimetype];
        if (expectedMagic) {
            const isValid = expectedMagic.some(magic => magicHex.startsWith(magic));
            if (!isValid) {
                this.logger.warn(`Magic byte mismatch: claimed=${file.mimetype}, bytes=${magicHex.substring(0, 16)}, file=${file.originalname}`);
                throw new common_1.BadRequestException('File content does not match declared file type');
            }
        }
    }
    sanitizeFilename(originalName) {
        let sanitized = path.basename(originalName);
        sanitized = sanitized.replace(/\x00/g, '');
        sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
        sanitized = sanitized.replace(/^\.+/, '');
        sanitized = sanitized.replace(/_+/g, '_');
        if (sanitized.length > 200) {
            const ext = path.extname(sanitized);
            sanitized = sanitized.substring(0, 200 - ext.length) + ext;
        }
        return sanitized || 'unnamed_file';
    }
    isImage(mimetype) {
        return mimetype.startsWith('image/');
    }
    getFileCategory(mimetype) {
        if (mimetype.startsWith('image/'))
            return 'image';
        if (mimetype.startsWith('video/'))
            return 'video';
        if (mimetype === 'application/zip')
            return 'archive';
        return 'document';
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('malware-scan')),
    __metadata("design:paramtypes", [config_1.ConfigService,
        bullmq_2.Queue])
], StorageService);
//# sourceMappingURL=storage.service.js.map