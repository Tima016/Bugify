// ============================================
// User Risk Score Service
// Weighted fraud signal aggregation with auto-restriction
// ============================================
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertService } from './alert.service';
import { MetricsService } from '../metrics/metrics.service';

const SIGNAL_WEIGHTS: Record<string, number> = {
    MULTI_ACCOUNT: 15,
    FAKE_FARMING: 10,
    LEADERBOARD_MANIPULATION: 5,
    PAYMENT_FRAUD: 20,
    INSIDER_THREAT: 20,
    BRUTEFORCE: 5,
    MALWARE: 10,
    RATE_LIMIT_ABUSE: 5,
    GRAPHQL_ABUSE: 5,
    SYSTEM: 0,
};

// Stacking: same category fires multiple times → only count max 2x weight
const MAX_CATEGORY_MULTIPLIER = 2;

@Injectable()
export class RiskScoreService {
    private readonly logger = new Logger(RiskScoreService.name);

    constructor(
        private prisma: PrismaService,
        private alertService: AlertService,
        private metricsService: MetricsService,
    ) { }

    /**
     * Recalculate risk score for a user based on 90-day alert history.
     * Auto-restricts at HIGH (60+) and CRITICAL (80+) thresholds.
     */
    async recalculate(userId: string): Promise<number> {
        const alerts = await this.prisma.securityAlert.findMany({
            where: {
                targetUserId: userId,
                status: { not: 'FALSE_POSITIVE' },
                createdAt: { gte: new Date(Date.now() - 90 * 24 * 3600 * 1000) },
            },
        });

        // Aggregate score by category with max multiplier
        const categoryCount: Record<string, number> = {};
        for (const alert of alerts) {
            categoryCount[alert.category] = (categoryCount[alert.category] || 0) + 1;
        }

        let score = 0;
        for (const [category, count] of Object.entries(categoryCount)) {
            const weight = SIGNAL_WEIGHTS[category] || 0;
            const effectiveCount = Math.min(count, MAX_CATEGORY_MULTIPLIER);
            score += weight * effectiveCount;
        }
        score = Math.min(score, 100);

        const level = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';

        // Check for admin override (skip auto-restriction if overridden within 30 days)
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { riskOverrideAt: true, riskLevel: true },
        });

        const overrideActive = user?.riskOverrideAt &&
            (Date.now() - user.riskOverrideAt.getTime()) < 30 * 24 * 3600 * 1000;

        const updateData: any = {
            riskScore: score,
            riskLevel: overrideActive ? user.riskLevel : level, // Preserve override
        };

        // Auto-restriction at CRITICAL (if no override)
        if (score >= 80 && !overrideActive) {
            updateData.riskLockedAt = new Date();
            updateData.isBanned = true;

            await this.alertService.fire({
                category: 'SYSTEM',
                severity: 'CRITICAL',
                title: `User auto-suspended: risk score ${score}`,
                description: `User ${userId} risk score reached ${score}/100. Account auto-suspended.`,
                targetUserId: userId,
                metadata: { score, level, categoryCount },
                cooldownKey: `risk_lock:${userId}`,
                cooldownMs: 60 * 60 * 1000,
            });
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // Prometheus gauge
        this.metricsService.userRiskScoreGauge.set({ level }, score);

        this.logger.log(`Risk score for user ${userId}: ${score} (${level})`);
        return score;
    }

    /**
     * Admin override — manually lower risk level.
     */
    async adminOverride(userId: string, adminId: string, newLevel: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                riskLevel: newLevel as any,
                riskOverrideBy: adminId,
                riskOverrideAt: new Date(),
                isBanned: false,
                riskLockedAt: null,
            },
        });

        await this.prisma.auditLog.create({
            data: {
                action: 'ADMIN_RISK_OVERRIDE',
                userId: adminId,
                resourceType: 'USER',
                resourceId: userId,
                changes: { newLevel },
            },
        });
    }
}
