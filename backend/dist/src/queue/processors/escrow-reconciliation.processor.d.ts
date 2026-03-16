import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertService } from '../../common/security/alert.service';
export declare class EscrowReconciliationProcessor extends WorkerHost {
    private prisma;
    private alertService;
    private readonly logger;
    constructor(prisma: PrismaService, alertService: AlertService);
    process(job: Job): Promise<void>;
    private verifyLedgerBalance;
    private verifyCompanyEscrows;
    private detectOrphanedPayouts;
}
