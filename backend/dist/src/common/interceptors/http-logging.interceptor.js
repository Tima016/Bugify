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
exports.HttpLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const metrics_service_1 = require("../metrics/metrics.service");
let HttpLoggingInterceptor = class HttpLoggingInterceptor {
    metricsService;
    logger = new common_1.Logger('HTTP');
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const { method, url, ip } = req;
        const correlationId = req.correlationId || '-';
        const startTime = Date.now();
        this.metricsService.activeConnections.inc();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                const res = context.switchToHttp().getResponse();
                const statusCode = res.statusCode;
                const duration = Date.now() - startTime;
                const route = this.normalizeRoute(url);
                this.logger.log(`${method} ${url} ${statusCode} ${duration}ms [${correlationId}] ${ip}`);
                this.metricsService.httpRequestTotal.inc({
                    method, route, status_code: String(statusCode),
                });
                this.metricsService.httpRequestDuration.observe({ method, route, status_code: String(statusCode) }, duration / 1000);
                if (statusCode >= 400) {
                    this.metricsService.httpErrorTotal.inc({
                        method, route, status_code: String(statusCode),
                    });
                }
                this.metricsService.activeConnections.dec();
            },
            error: (err) => {
                const duration = Date.now() - startTime;
                const statusCode = err.status || 500;
                const route = this.normalizeRoute(url);
                this.logger.error(`${method} ${url} ${statusCode} ${duration}ms [${correlationId}] ${ip} - ${err.message}`);
                this.metricsService.httpRequestTotal.inc({
                    method, route, status_code: String(statusCode),
                });
                this.metricsService.httpRequestDuration.observe({ method, route, status_code: String(statusCode) }, duration / 1000);
                this.metricsService.httpErrorTotal.inc({
                    method, route, status_code: String(statusCode),
                });
                this.metricsService.activeConnections.dec();
            },
        }));
    }
    normalizeRoute(url) {
        return url
            .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
            .replace(/\/\d+/g, '/:id')
            .split('?')[0];
    }
};
exports.HttpLoggingInterceptor = HttpLoggingInterceptor;
exports.HttpLoggingInterceptor = HttpLoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], HttpLoggingInterceptor);
//# sourceMappingURL=http-logging.interceptor.js.map