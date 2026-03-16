// ============================================
// Upload Controller — Secured File Upload Endpoints
// Auth-guarded, rate-limited, with structured responses
// ============================================
import {
    Controller, Post, UploadedFile, UseGuards, UseInterceptors,
    HttpCode, HttpStatus, ParseFilePipe, MaxFileSizeValidator,
    BadRequestException, Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { StorageService, UploadResult } from './storage.service';

// 25 MB max at the HTTP layer (individual type limits enforced in StorageService)
const MAX_HTTP_FILE_SIZE = 25 * 1024 * 1024;

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadController {
    constructor(private storageService: StorageService) { }

    @Post('report/:reportId/attachment')
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 uploads per minute
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    async uploadReportAttachment(
        @UploadedFile() file: Express.Multer.File,
        @Param('reportId') reportId: string,
        @GetUser() user: any,
    ): Promise<{ data: UploadResult }> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const result = await this.storageService.uploadReportAttachment(file, reportId);

        return { data: result };
    }

    @Post('profile-picture')
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 per minute
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: any,
    ): Promise<{ data: UploadResult }> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const result = await this.storageService.uploadProfilePicture(file, user.id);

        return { data: result };
    }

    @Post('kyc')
    @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 per 5 minutes
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    async uploadKycDocument(
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: any,
    ): Promise<{ data: UploadResult }> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const result = await this.storageService.uploadKycDocument(file, user.id);

        return { data: result };
    }
}
