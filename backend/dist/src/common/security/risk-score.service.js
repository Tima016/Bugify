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
var RiskScoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskScoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const alert_service_1 = require("./alert.service");
const metrics_service_1 = require("../metrics/metrics.service");
const SIGNAL_WEIGHTS = {
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
const MAX_CATEGORY_MULTIPLIER = 2;
let RiskScoreService = RiskScoreService_1 = class RiskScoreService {
    prisma;
    alertService;
    metricsService;
    logger = new common_1.Logger(RiskScoreService_1.name);
    constructor(prisma, alertService, metricsService) {
        this.prisma = prisma;
        this.alertService = alertService;
        this.metricsService = metricsService;
    }
    async recalculate(userId) {
        const alerts = await this.prisma.securityAlert.findMany({
            where: {
                targetUserId: userId,
                status: { not: 'FALSE_POSITIVE' },
                createdAt: { gte: new Date(Date.now() - 90 * 24 * 3600 * 1000) },
            },
        });
        const categoryCount = {};
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
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { riskOverrideAt: true, riskLevel: true },
        });
        const overrideActive = user?.riskOverrideAt &&
            (Date.now() - user.riskOverrideAt.getTime()) < 30 * 24 * 3600 * 1000;
        const updateData = {
            riskScore: score,
            riskLevel: overrideActive ? user.riskLevel : level,
        };
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
        this.metricsService.userRiskScoreGauge.set({ level }, score);
        this.logger.log(`Risk score for user ${userId}: ${score} (${level})`);
        return score;
    }
    async adminOverride(userId, adminId, newLevel) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                riskLevel: newLevel,
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
};
exports.RiskScoreService = RiskScoreService;
exports.RiskScoreService = RiskScoreService = RiskScoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        alert_service_1.AlertService,
        metrics_service_1.MetricsService])
], RiskScoreService);
//# sourceMappingURL=risk-score.service.js.map