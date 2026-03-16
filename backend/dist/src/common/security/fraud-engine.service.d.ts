import { PrismaService } from '../../prisma/prisma.service';
import { AlertService } from './alert.service';
export declare class FraudEngine {
    private prisma;
    private alertService;
    private cache;
    private readonly logger;
    constructor(prisma: PrismaService, alertService: AlertService, cache: any);
    checkIpClustering(userId: string, ip: string): Promise<void>;
    checkSubmissionVelocity(userId: string): Promise<boolean>;
    checkPocReuse(userId: string, proofOfConcept: string): Promise<boolean>;
    checkSeverityDistribution(userId: string): Promise<void>;
    checkPayoutVelocity(userId: string, requestedAmount: number): Promise<boolean>;
    checkAdminBulkChanges(adminUserId: string): Promise<void>;
    checkWalletClustering(userId: string, walletAddress: string): Promise<boolean>;
    checkSelfApproval(reportId: string, approverUserId: string): Promise<boolean>;
}
