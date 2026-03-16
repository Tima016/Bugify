import { OnModuleInit } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';
export declare class MetricsService implements OnModuleInit {
    readonly registry: Registry<"text/plain; version=0.0.4; charset=utf-8">;
    readonly httpRequestDuration: Histogram;
    readonly httpRequestTotal: Counter;
    readonly httpErrorTotal: Counter;
    readonly loginAttempts: Counter;
    readonly loginFailures: Counter;
    readonly tokenRefreshes: Counter;
    readonly reportSubmissions: Counter;
    readonly payoutsProcessed: Counter;
    readonly payoutAmount: Counter;
    readonly fileUploads: Counter;
    readonly malwareDetections: Counter;
    readonly securityAlertsTotal: Counter;
    readonly activeConnections: Gauge;
    readonly userRiskScoreGauge: Gauge;
    readonly escrowReconciliation: Counter;
    constructor();
    onModuleInit(): void;
    getMetrics(): Promise<string>;
}
