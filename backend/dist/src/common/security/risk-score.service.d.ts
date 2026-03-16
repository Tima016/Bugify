import { PrismaService } from '../../prisma/prisma.service';
import { AlertService } from './alert.service';
import { MetricsService } from '../metrics/metrics.service';
export declare class RiskScoreService {
    private prisma;
    private alertService;
    private metricsService;
    private readonly logger;
    constructor(prisma: PrismaService, alertService: AlertService, metricsService: MetricsService);
    recalculate(userId: string): Promise<number>;
    adminOverride(userId: string, adminId: string, newLevel: string): Promise<void>;
}
