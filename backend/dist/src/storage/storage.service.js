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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const sharp_1 = __importDefault(require("sharp"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
let StorageService = class StorageService {
    configService;
    s3Client;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        this.s3Client = new client_s3_1.S3Client({
            region: this.configService.get('AWS_REGION') || 'us-east-1',
            endpoint: this.configService.get('S3_ENDPOINT'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
            },
            forcePathStyle: true,
        });
        this.bucketName = this.configService.get('S3_BUCKET_NAME') || 'uzsecure-uploads';
    }
    async uploadFile(options) {
        const { file, folder = 'general', resize } = options;
        this.validateFile(file);
        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const key = folder ? `${folder}/${fileName}` : fileName;
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
            Metadata: {
                originalName: file.originalname,
            },
        });
        await this.s3Client.send(command);
        return key;
    }
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
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
    validateFile(file) {
        const maxSize = this.configService.get('MAX_FILE_SIZE') || 52428800;
        if (file.size > maxSize) {
            throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
        }
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/json',
            'application/zip',
            'application/x-rar-compressed',
            'video/mp4',
            'video/webm',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`File type ${file.mimetype} is not allowed`);
        }
        this.validateMagicBytes(file);
    }
    validateMagicBytes(file) {
        const buffer = file.buffer;
        const magicBytes = buffer.slice(0, 4).toString('hex');
        const validMagicBytes = {
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
    isImage(mimetype) {
        return mimetype.startsWith('image/');
    }
    async uploadProfilePicture(file, userId) {
        return await this.uploadFile({
            file,
            folder: `profiles/${userId}`,
            resize: { width: 400, height: 400 },
        });
    }
    async uploadReportAttachment(file, reportId) {
        return await this.uploadFile({
            file,
            folder: `reports/${reportId}`,
        });
    }
    async uploadKycDocument(file, userId) {
        return await this.uploadFile({
            file,
            folder: `kyc/${userId}`,
        });
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map