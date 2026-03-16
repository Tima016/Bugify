import { StorageService, UploadResult } from './storage.service';
export declare class UploadController {
    private storageService;
    constructor(storageService: StorageService);
    uploadReportAttachment(file: Express.Multer.File, reportId: string, user: any): Promise<{
        data: UploadResult;
    }>;
    uploadProfilePicture(file: Express.Multer.File, user: any): Promise<{
        data: UploadResult;
    }>;
    uploadKycDocument(file: Express.Multer.File, user: any): Promise<{
        data: UploadResult;
    }>;
}
