// ============================================
// Storage Module — Hardened with upload controller + scan queue
// ============================================
import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { StorageService } from './storage.service';
import { UploadController } from './upload.controller';

@Global()
@Module({
    imports: [
        BullModule.registerQueue({ name: 'malware-scan' }),
    ],
    controllers: [UploadController],
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule { }
