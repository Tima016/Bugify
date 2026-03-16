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
    cooldownKey?: string;
    cooldownMs?: number;
}
export declare class AlertService {
    private prisma;
    private metricsService;
    private cache;
    private alertQueue;
    private readonly logger;
    constructor(prisma: PrismaService, metricsService: MetricsService, cache: any, alertQueue: Queue);
    fire(payload: AlertPayload): Promise<string | null>;
    getOpenAlerts(filters?: {
        severity?: AlertSeverity;
        category?: AlertCategory;
        limit?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import(".prisma/client").$Enums.AlertStatus;
        title: string;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        resolvedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        category: import(".prisma/client").$Enums.AlertCategory;
        targetUserId: string | null;
        sourceIp: string | null;
        cooldownKey: string | null;
        resolvedBy: string | null;
    }[]>;
    resolve(alertId: string, resolvedBy: string, status?: 'RESOLVED' | 'FALSE_POSITIVE'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import(".prisma/client").$Enums.AlertStatus;
        title: string;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        resolvedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        category: import(".prisma/client").$Enums.AlertCategory;
        targetUserId: string | null;
        sourceIp: string | null;
        cooldownKey: string | null;
        resolvedBy: string | null;
    }>;
}
