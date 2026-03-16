// ============================================
// Prometheus Metrics Service
// Exposes request latency, error rates, and business metrics
// ============================================
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    Registry,
    Counter,
    Histogram,
    Gauge,
    collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
    readonly registry = new Registry();

    // ---- HTTP Metrics ----
    readonly httpRequestDuration: Histogram;
    readonly httpRequestTotal: Counter;
    readonly httpErrorTotal: Counter;

    // ---- Auth Metrics ----
    readonly loginAttempts: Counter;
    readonly loginFailures: Counter;
    readonly tokenRefreshes: Counter;

    // ---- Business Metrics ----
    readonly reportSubmissions: Counter;
    readonly payoutsProcessed: Counter;
    readonly payoutAmount: Counter;
    readonly fileUploads: Counter;
    readonly malwareDetections: Counter;

    // ---- Security Alerts ----
    readonly securityAlertsTotal: Counter;

    // ---- System Metrics ----
    readonly activeConnections: Gauge;
    readonly userRiskScoreGauge: Gauge;
    readonly escrowReconciliation: Counter;

    constructor() {
        // HTTP
        this.httpRequestDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
            registers: [this.registry],
        });

        this.httpRequestTotal = new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.registry],
        });

        this.httpErrorTotal = new Counter({
            name: 'http_errors_total',
            help: 'Total number of HTTP errors (4xx + 5xx)',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.registry],
        });

        // Auth
        this.loginAttempts = new Counter({
            name: 'auth_login_attempts_total',
            help: 'Total login attempts',
            labelNames: ['status'], // 'success' | 'failure'
            registers: [this.registry],
        });

        this.loginFailures = new Counter({
            name: 'auth_login_failures_total',
            help: 'Total failed login attempts',
            labelNames: ['reason'], // 'invalid_credentials' | 'locked_out' | '2fa_failed'
            registers: [this.registry],
        });

        this.tokenRefreshes = new Counter({
            name: 'auth_token_refreshes_total',
            help: 'Total token refresh operations',
            labelNames: ['status'], // 'success' | 'revoked' | 'theft_detected'
            registers: [this.registry],
        });

        // Business
        this.reportSubmissions = new Counter({
            name: 'business_report_submissions_total',
            help: 'Total vulnerability reports submitted',
            labelNames: ['severity'],
            registers: [this.registry],
        });

        this.payoutsProcessed = new Counter({
            name: 'business_payouts_processed_total',
            help: 'Total payouts processed',
            registers: [this.registry],
        });

        this.payoutAmount = new Counter({
            name: 'business_payout_amount_total',
            help: 'Total payout amount in USD',
            registers: [this.registry],
        });

        this.fileUploads = new Counter({
            name: 'storage_file_uploads_total',
            help: 'Total file uploads',
            labelNames: ['category', 'scan_status'], // e.g., 'image', 'queued'
            registers: [this.registry],
        });

        this.malwareDetections = new Counter({
            name: 'security_malware_detections_total',
            help: 'Total malware detections and quarantines',
            registers: [this.registry],
        });

        // Security Alerts
        this.securityAlertsTotal = new Counter({
            name: 'security_alerts_total',
            help: 'Total security alerts fired',
            labelNames: ['category', 'severity'],
            registers: [this.registry],
        });

        // System
        this.activeConnections = new Gauge({
            name: 'system_active_connections',
            help: 'Number of currently active connections',
            registers: [this.registry],
        });

        // Risk Scoring
        this.userRiskScoreGauge = new Gauge({
            name: 'user_risk_score',
            help: 'Current risk score for users',
            labelNames: ['level'],
            registers: [this.registry],
        });

        // Escrow Reconciliation
        this.escrowReconciliation = new Counter({
            name: 'escrow_reconciliation_runs_total',
            help: 'Total escrow reconciliation runs',
            labelNames: ['result'], // 'balanced' | 'mismatch'
            registers: [this.registry],
        });
    }

    onModuleInit() {
        // Collect default Node.js metrics (CPU, memory, event loop, GC)
        collectDefaultMetrics({ register: this.registry });
    }

    /**
     * Get all metrics in Prometheus text format.
     */
    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }
}
