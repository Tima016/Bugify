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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
let MetricsService = class MetricsService {
    registry = new prom_client_1.Registry();
    httpRequestDuration;
    httpRequestTotal;
    httpErrorTotal;
    loginAttempts;
    loginFailures;
    tokenRefreshes;
    reportSubmissions;
    payoutsProcessed;
    payoutAmount;
    fileUploads;
    malwareDetections;
    securityAlertsTotal;
    activeConnections;
    userRiskScoreGauge;
    escrowReconciliation;
    constructor() {
        this.httpRequestDuration = new prom_client_1.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
            registers: [this.registry],
        });
        this.httpRequestTotal = new prom_client_1.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.registry],
        });
        this.httpErrorTotal = new prom_client_1.Counter({
            name: 'http_errors_total',
            help: 'Total number of HTTP errors (4xx + 5xx)',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.registry],
        });
        this.loginAttempts = new prom_client_1.Counter({
            name: 'auth_login_attempts_total',
            help: 'Total login attempts',
            labelNames: ['status'],
            registers: [this.registry],
        });
        this.loginFailures = new prom_client_1.Counter({
            name: 'auth_login_failures_total',
            help: 'Total failed login attempts',
            labelNames: ['reason'],
            registers: [this.registry],
        });
        this.tokenRefreshes = new prom_client_1.Counter({
            name: 'auth_token_refreshes_total',
            help: 'Total token refresh operations',
            labelNames: ['status'],
            registers: [this.registry],
        });
        this.reportSubmissions = new prom_client_1.Counter({
            name: 'business_report_submissions_total',
            help: 'Total vulnerability reports submitted',
            labelNames: ['severity'],
            registers: [this.registry],
        });
        this.payoutsProcessed = new prom_client_1.Counter({
            name: 'business_payouts_processed_total',
            help: 'Total payouts processed',
            registers: [this.registry],
        });
        this.payoutAmount = new prom_client_1.Counter({
            name: 'business_payout_amount_total',
            help: 'Total payout amount in USD',
            registers: [this.registry],
        });
        this.fileUploads = new prom_client_1.Counter({
            name: 'storage_file_uploads_total',
            help: 'Total file uploads',
            labelNames: ['category', 'scan_status'],
            registers: [this.registry],
        });
        this.malwareDetections = new prom_client_1.Counter({
            name: 'security_malware_detections_total',
            help: 'Total malware detections and quarantines',
            registers: [this.registry],
        });
        this.securityAlertsTotal = new prom_client_1.Counter({
            name: 'security_alerts_total',
            help: 'Total security alerts fired',
            labelNames: ['category', 'severity'],
            registers: [this.registry],
        });
        this.activeConnections = new prom_client_1.Gauge({
            name: 'system_active_connections',
            help: 'Number of currently active connections',
            registers: [this.registry],
        });
        this.userRiskScoreGauge = new prom_client_1.Gauge({
            name: 'user_risk_score',
            help: 'Current risk score for users',
            labelNames: ['level'],
            registers: [this.registry],
        });
        this.escrowReconciliation = new prom_client_1.Counter({
            name: 'escrow_reconciliation_runs_total',
            help: 'Total escrow reconciliation runs',
            labelNames: ['result'],
            registers: [this.registry],
        });
    }
    onModuleInit() {
        (0, prom_client_1.collectDefaultMetrics)({ register: this.registry });
    }
    async getMetrics() {
        return this.registry.metrics();
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map