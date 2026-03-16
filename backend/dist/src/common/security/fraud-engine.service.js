"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FraudEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudEngine = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../../prisma/prisma.service");
const alert_service_1 = require("./alert.service");
const crypto_1 = require("crypto");
const IP_CLUSTER_THRESHOLD = 3;
const IP_CLUSTER_WINDOW_DAYS = 7;
const SUBMISSION_VELOCITY_LIMIT = 10;
const LOW_SEVERITY_RATIO_THRESHOLD = 0.8;
const LOW_SEVERITY_MIN_REPORTS = 15;
const POC_REUSE_THRESHOLD = 3;
const PAYOUT_VELOCITY_USD = 5000;
const ADMIN_BULK_STATUS_LIMIT = 20;
let FraudEngine = FraudEngine_1 = class FraudEngine {
    prisma;
    alertService;
    cache;
    logger = new common_1.Logger(FraudEngine_1.name);
    constructor(prisma, alertService, cache) {
        this.prisma = prisma;
        this.alertService = alertService;
        this.cache = cache;
    }
    async checkIpClustering(userId, ip) {
        const subnet = ip.split('.').slice(0, 3).join('.');
        const cacheKey = `ip_cluster:${subnet}`;
        const existing = await this.cache.get(cacheKey);
        const userSet = existing ? new Set(JSON.parse(existing)) : new Set();
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
                cooldownMs: 60 * 60 * 1000,
            });
        }
    }
    async checkSubmissionVelocity(userId) {
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
            return true;
        }
        return false;
    }
    async checkPocReuse(userId, proofOfConcept) {
        if (!proofOfConcept || proofOfConcept.length < 50)
            return false;
        const pocHash = (0, crypto_1.createHash)('sha256')
            .update(proofOfConcept.substring(0, 500))
            .digest('hex')
            .substring(0, 16);
        const cacheKey = `poc_hash:${userId}:${pocHash}`;
        const count = Number(await this.cache.get(cacheKey) || 0) + 1;
        await this.cache.set(cacheKey, String(count), 30 * 24 * 60 * 60 * 1000);
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
    async checkSeverityDistribution(userId) {
        const reports = await this.prisma.report.groupBy({
            by: ['severity'],
            where: {
                researcherId: userId,
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            _count: true,
        });
        const total = reports.reduce((sum, r) => sum + r._count, 0);
        if (total < LOW_SEVERITY_MIN_REPORTS)
            return;
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
                cooldownMs: 24 * 60 * 60 * 1000,
            });
        }
    }
    async checkPayoutVelocity(userId, requestedAmount) {
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
            return true;
        }
        return false;
    }
    async checkAdminBulkChanges(adminUserId) {
        const cacheKey = `admin_bulk:${adminUserId}`;
        const count = Number(await this.cache.get(cacheKey) || 0) + 1;
        await this.cache.set(cacheKey, String(count), 60 * 60 * 1000);
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
    async checkWalletClustering(userId, walletAddress) {
        if (!walletAddress)
            return false;
        const allPayouts = await this.prisma.payoutRequest.findMany({
            where: {
                researcherId: { not: userId },
            },
            select: { researcherId: true, destination: true },
        });
        const otherUsers = allPayouts
            .filter(p => {
            const dest = p.destination;
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
            return true;
        }
        return false;
    }
    async checkSelfApproval(reportId, approverUserId) {
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
            return true;
        }
        return false;
    }
};
exports.FraudEngine = FraudEngine;
exports.FraudEngine = FraudEngine = FraudEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        alert_service_1.AlertService, Object])
], FraudEngine);
//# sourceMappingURL=fraud-engine.service.js.map