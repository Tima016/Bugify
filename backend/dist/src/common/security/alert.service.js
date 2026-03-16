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
var AlertService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../prisma/prisma.service");
const metrics_service_1 = require("../metrics/metrics.service");
const SEVERITY_COOLDOWN = {
    LOW: 24 * 60 * 60 * 1000,
    MEDIUM: 60 * 60 * 1000,
    HIGH: 15 * 60 * 1000,
    CRITICAL: 0,
};
let AlertService = AlertService_1 = class AlertService {
    prisma;
    metricsService;
    cache;
    alertQueue;
    logger = new common_1.Logger(AlertService_1.name);
    constructor(prisma, metricsService, cache, alertQueue) {
        this.prisma = prisma;
        this.metricsService = metricsService;
        this.cache = cache;
        this.alertQueue = alertQueue;
    }
    async fire(payload) {
        const { category, severity, title, description, targetUserId, sourceIp, metadata, cooldownKey } = payload;
        if (cooldownKey && severity !== 'CRITICAL') {
            const cooldownMs = payload.cooldownMs || SEVERITY_COOLDOWN[severity] || 3600000;
            const cacheKey = `alert_cd:${cooldownKey}`;
            const existing = await this.cache.get(cacheKey);
            if (existing) {
                this.logger.debug(`Alert suppressed by cooldown: ${cooldownKey}`);
                return null;
            }
            await this.cache.set(cacheKey, '1', cooldownMs);
        }
        const alert = await this.prisma.securityAlert.create({
            data: {
                category,
                severity,
                title,
                description,
                targetUserId,
                sourceIp,
                metadata: metadata || undefined,
                cooldownKey,
            },
        });
        this.logger.warn(`🚨 SECURITY ALERT [${severity}] ${category}: ${title} (alert=${alert.id}, user=${targetUserId || 'N/A'})`);
        await this.alertQueue.add('dispatch-alert', {
            alertId: alert.id,
            category,
            severity,
            title,
            description,
            targetUserId,
            sourceIp,
            metadata,
        }, {
            priority: severity === 'CRITICAL' ? 1 : severity === 'HIGH' ? 2 : 3,
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
        });
        this.metricsService.securityAlertsTotal.inc({
            category,
            severity,
        });
        return alert.id;
    }
    async getOpenAlerts(filters) {
        return this.prisma.securityAlert.findMany({
            where: {
                status: 'OPEN',
                ...(filters?.severity && { severity: filters.severity }),
                ...(filters?.category && { category: filters.category }),
            },
            orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
            take: filters?.limit || 50,
        });
    }
    async resolve(alertId, resolvedBy, status = 'RESOLVED') {
        return this.prisma.securityAlert.update({
            where: { id: alertId },
            data: { status, resolvedBy, resolvedAt: new Date() },
        });
    }
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = AlertService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(3, (0, bullmq_1.InjectQueue)('alerts')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        metrics_service_1.MetricsService, Object, bullmq_2.Queue])
], AlertService);
//# sourceMappingURL=alert.service.js.map