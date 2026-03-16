// ============================================
// Alert Service — Central security alert dispatcher
// Handles cooldowns, persistence, escalation, and notification queueing
// ============================================
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import { AlertSeverity, AlertCategory } from '@prisma/client';

export interface AlertPayload {
    category: AlertCategory;
    severity: AlertSeverity;
    title: string;
    description: string;
    targetUserId?: string;
    sourceIp?: string;
    metadata?: Record<string, any>;
    cooldownKey?: string;    // Dedup key — if set, cooldown logic applies
    cooldownMs?: number;     // Cooldown window in ms (default per severity)
}

// Default cooldown per severity
const SEVERITY_COOLDOWN: Record<string, number> = {
    LOW: 24 * 60 * 60 * 1000,       // 24 hours
    MEDIUM: 60 * 60 * 1000,         // 1 hour
    HIGH: 15 * 60 * 1000,           // 15 minutes
    CRITICAL: 0,                     // No cooldown — always fire
};

@Injectable()
export class AlertService {
    private readonly logger = new Logger(AlertService.name);

    constructor(
        private prisma: PrismaService,
        private metricsService: MetricsService,
        @Inject(CACHE_MANAGER) private cache: any,
        @InjectQueue('alerts') private alertQueue: Queue,
    ) { }

    /**
     * Fire a security alert with cooldown deduplication.
     * Returns the alert ID if created, null if suppressed by cooldown.
     */
    async fire(payload: AlertPayload): Promise<string | null> {
        const { category, severity, title, description, targetUserId, sourceIp, metadata, cooldownKey } = payload;

        // 1. Check cooldown
        if (cooldownKey && severity !== 'CRITICAL') {
            const cooldownMs = payload.cooldownMs || SEVERITY_COOLDOWN[severity] || 3600000;
            const cacheKey = `alert_cd:${cooldownKey}`;
            const existing = await this.cache.get(cacheKey);

            if (existing) {
                this.logger.debug(`Alert suppressed by cooldown: ${cooldownKey}`);
                return null;
            }

            // Set cooldown marker
            await this.cache.set(cacheKey, '1', cooldownMs);
        }

        // 2. Persist to database
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

        this.logger.warn(
            `🚨 SECURITY ALERT [${severity}] ${category}: ${title} (alert=${alert.id}, user=${targetUserId || 'N/A'})`,
        );

        // 3. Queue notification delivery
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

        // 4. Increment Prometheus counter
        this.metricsService.securityAlertsTotal.inc({
            category,
            severity,
        });

        return alert.id;
    }

    /**
     * Get open alerts, optionally filtered.
     */
    async getOpenAlerts(filters?: { severity?: AlertSeverity; category?: AlertCategory; limit?: number }) {
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

    /**
     * Resolve an alert.
     */
    async resolve(alertId: string, resolvedBy: string, status: 'RESOLVED' | 'FALSE_POSITIVE' = 'RESOLVED') {
        return this.prisma.securityAlert.update({
            where: { id: alertId },
            data: { status, resolvedBy, resolvedAt: new Date() },
        });
    }
}
