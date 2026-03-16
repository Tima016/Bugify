// ============================================
// Fraud Engine — Multi-signal abuse detection
// Runs on login, report submission, and payout events
// ============================================
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertService } from './alert.service';
import { createHash } from 'crypto';

// ---- Thresholds ----
const IP_CLUSTER_THRESHOLD = 3;            // accounts per /24 subnet
const IP_CLUSTER_WINDOW_DAYS = 7;
const SUBMISSION_VELOCITY_LIMIT = 10;       // reports per 24h
const LOW_SEVERITY_RATIO_THRESHOLD = 0.8;  // 80% LOW/INFO
const LOW_SEVERITY_MIN_REPORTS = 15;
const POC_REUSE_THRESHOLD = 3;             // same hash count
const PAYOUT_VELOCITY_USD = 5000;          // max USD per 24h
const ADMIN_BULK_STATUS_LIMIT = 20;        // status changes per hour

@Injectable()
export class FraudEngine {
    private readonly logger = new Logger(FraudEngine.name);

    constructor(
        private prisma: PrismaService,
        private alertService: AlertService,
        @Inject(CACHE_MANAGER) private cache: any,
    ) { }

    // ============================================
    // Signal 1: Multi-Account IP Clustering
    // Called on every login
    // ============================================
    async checkIpClustering(userId: string, ip: string): Promise<void> {
        const subnet = ip.split('.').slice(0, 3).join('.'); // /24
        const cacheKey = `ip_cluster:${subnet}`;

        // Add userId to the subnet set
        const existing = await this.cache.get(cacheKey);
        const userSet: Set<string> = existing ? new Set(JSON.parse(existing)) : new Set();
        userSet.add(userId);

        await this.cache.set(cacheKey, JSON.stringify([...userSet]), IP_CLUSTER_WINDOW_DAYS * 86400 * 1000);

        if (userSet.size >= IP_CLUSTER_THRESHOLD) {
            await this.alertService.fire({
                category: 'MULTI_ACCOUNT',
                severity: userSet.size >= 5 ? 'HIGH' : 'MEDIUM',
                title: `IP cluster: ${userSet.size} accounts on ${subnet}.0/24`,
                description: `Users ${[...userSet].join(', ')} logged in from the same /24 subnet within ${IP_CLUSTER_WINDOW_DAYS} days.`,
                targetUserId: userId,
                sourceIp: ip,
                metadata: { subnet, accounts: [...userSet], count: userSet.size },
                cooldownKey: `ip_cluster:${subnet}`,
                cooldownMs: 60 * 60 * 1000, // 1h cooldown per subnet
            });
        }
    }

    // ============================================
    // Signal 2: Submission Velocity
    // Called on every report submission
    // ============================================
    async checkSubmissionVelocity(userId: string): Promise<boolean> {
        const cacheKey = `sub_vel:${userId}`;
        const count = Number(await this.cache.get(cacheKey) || 0) + 1;
        await this.cache.set(cacheKey, String(count), 24 * 60 * 60 * 1000);

        if (count > SUBMISSION_VELOCITY_LIMIT) {
            await this.alertService.fire({
                category: 'FAKE_FARMING',
                severity: 'MEDIUM',
                title: `High submission velocity: ${count} reports/24h`,
                description: `User ${userId} submitted ${count} reports in the last 24 hours (limit: ${SUBMISSION_VELOCITY_LIMIT}).`,
                targetUserId: userId,
                metadata: { count, limit: SUBMISSION_VELOCITY_LIMIT },
                cooldownKey: `sub_vel:${userId}`,
            });
            return true; // Flag for manual review
        }
        return false;
    }

    // ============================================
    // Signal 3: PoC Pattern Reuse
    // Called on report submission
    // ============================================
    async checkPocReuse(userId: string, proofOfConcept: string): Promise<boolean> {
        if (!proofOfConcept || proofOfConcept.length < 50) return false;

        // Hash first 500 chars of PoC
        const pocHash = createHash('sha256')
            .update(proofOfConcept.substring(0, 500))
            .digest('hex')
            .substring(0, 16);

        const cacheKey = `poc_hash:${userId}:${pocHash}`;
        const count = Number(await this.cache.get(cacheKey) || 0) + 1;
        await this.cache.set(cacheKey, String(count), 30 * 24 * 60 * 60 * 1000); // 30 days

        if (count >= POC_REUSE_THRESHOLD) {
            await this.alertService.fire({
                category: 'FAKE_FARMING',
                severity: 'MEDIUM',
                title: `PoC pattern reuse: ${count} submissions with same hash`,
                description: `User ${userId} submitted ${count} reports with identical PoC pattern (hash: ${pocHash}).`,
                targetUserId: userId,
                metadata: { pocHash, count },
                cooldownKey: `poc_reuse:${userId}:${pocHash}`,
            });
            return true;
        }
        return false;
    }

    // ============================================
    // Signal 4: Low Severity Ratio
    // Called periodically or on triage
    // ============================================
    async checkSeverityDistribution(userId: string): Promise<void> {
        const reports = await this.prisma.report.groupBy({
            by: ['severity'],
            where: {
                researcherId: userId,
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            _count: true,
        });

        const total = reports.reduce((sum, r) => sum + r._count, 0);
        if (total < LOW_SEVERITY_MIN_REPORTS) return;

        const lowCount = reports
            .filter(r => r.severity === 'LOW' || r.severity === 'INFORMATIONAL')
            .reduce((sum, r) => sum + r._count, 0);

        const ratio = lowCount / total;

        if (ratio >= LOW_SEVERITY_RATIO_THRESHOLD) {
            await this.alertService.fire({
                category: 'FAKE_FARMING',
                severity: 'MEDIUM',
                title: `Low severity farming: ${(ratio * 100).toFixed(0)}% LOW/INFO`,
                description: `User ${userId} has ${(ratio * 100).toFixed(0)}% LOW/INFO reports (${lowCount}/${total}) in the last 30 days.`,
                targetUserId: userId,
                metadata: { ratio, lowCount, total, distribution: reports },
                cooldownKey: `sev_dist:${userId}`,
                cooldownMs: 24 * 60 * 60 * 1000, // Daily check
            });
        }
    }

    // ============================================
    // Signal 5: Payout Velocity
    // Called before every payout
    // ============================================
    async checkPayoutVelocity(userId: string, requestedAmount: number): Promise<boolean> {
        const recentPayouts = await this.prisma.ledgerEntry.aggregate({
            where: {
                accountId: `user_wallet:${userId}`,
                type: 'CREDIT',
                referenceType: 'REPORT_PAYOUT',
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
            _sum: { amount: true },
        });

        const totalToday = Number(recentPayouts._sum.amount || 0) + requestedAmount;

        if (totalToday > PAYOUT_VELOCITY_USD) {
            await this.alertService.fire({
                category: 'PAYMENT_FRAUD',
                severity: 'HIGH',
                title: `Payout velocity exceeded: $${totalToday.toFixed(2)}/24h`,
                description: `User ${userId} attempting to receive $${totalToday.toFixed(2)} in 24h (limit: $${PAYOUT_VELOCITY_USD}).`,
                targetUserId: userId,
                metadata: { totalToday, requestedAmount, limit: PAYOUT_VELOCITY_USD },
                cooldownKey: `payout_vel:${userId}`,
                cooldownMs: 15 * 60 * 1000,
            });
            return true; // Block payout
        }
        return false;
    }

    // ============================================
    // Signal 6: Admin Bulk Status Changes
    // Called on every status transition by admin
    // ============================================
    async checkAdminBulkChanges(adminUserId: string): Promise<void> {
        const cacheKey = `admin_bulk:${adminUserId}`;
        const count = Number(await this.cache.get(cacheKey) || 0) + 1;
        await this.cache.set(cacheKey, String(count), 60 * 60 * 1000); // 1h window

        if (count > ADMIN_BULK_STATUS_LIMIT) {
            await this.alertService.fire({
                category: 'INSIDER_THREAT',
                severity: 'HIGH',
                title: `Admin bulk action: ${count} status changes/hour`,
                description: `Admin ${adminUserId} made ${count} report status changes in 1 hour (limit: ${ADMIN_BULK_STATUS_LIMIT}).`,
                targetUserId: adminUserId,
                metadata: { count, limit: ADMIN_BULK_STATUS_LIMIT },
                cooldownKey: `admin_bulk:${adminUserId}`,
                cooldownMs: 30 * 60 * 1000,
            });
        }
    }

    // ============================================
    // Signal 7: Wallet Clustering (same payout destination)
    // Called on payout request
    // ============================================
    async checkWalletClustering(userId: string, walletAddress: string): Promise<boolean> {
        if (!walletAddress) return false;

        // Search PayoutRequest destination JSON for matching wallet
        const allPayouts = await this.prisma.payoutRequest.findMany({
            where: {
                researcherId: { not: userId },
            },
            select: { researcherId: true, destination: true },
        });

        // Check if any other user's destination contains the same wallet
        const otherUsers = allPayouts
            .filter(p => {
                const dest = p.destination as any;
                return dest?.walletAddress === walletAddress || dest?.accountNumber === walletAddress;
            })
            .map(p => p.researcherId);

        const uniqueOtherUsers = [...new Set(otherUsers)];

        if (uniqueOtherUsers.length > 0) {
            await this.alertService.fire({
                category: 'MULTI_ACCOUNT',
                severity: 'CRITICAL',
                title: `Wallet clustering: ${uniqueOtherUsers.length + 1} accounts share wallet`,
                description: `Users ${[userId, ...uniqueOtherUsers].join(', ')} share payout wallet ${walletAddress.substring(0, 10)}...`,
                targetUserId: userId,
                metadata: { walletAddress, accounts: [userId, ...uniqueOtherUsers] },
                cooldownKey: `wallet:${walletAddress}`,
            });
            return true; // Block payout
        }
        return false;
    }

    // ============================================
    // Signal 8: Self-Approval Detection
    // Called on payout approval
    // ============================================
    async checkSelfApproval(reportId: string, approverUserId: string): Promise<boolean> {
        const transitions = await this.prisma.reportStatusTransition.findMany({
            where: { reportId },
            orderBy: { createdAt: 'asc' },
        });

        const triager = transitions.find(t => t.newStatus === 'TRIAGED')?.changedBy;

        if (triager && triager === approverUserId) {
            await this.alertService.fire({
                category: 'INSIDER_THREAT',
                severity: 'CRITICAL',
                title: `Self-approval: triage + approval by same admin`,
                description: `Admin ${approverUserId} both triaged and approved payout for report ${reportId}.`,
                targetUserId: approverUserId,
                metadata: { reportId, triager, approver: approverUserId },
            });
            return true; // Block
        }
        return false;
    }
}
