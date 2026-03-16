// ============================================
// HTTP Logging Interceptor
// Logs every request with method, url, status, duration, correlation ID
// Records Prometheus metrics for request count and latency
// ============================================
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    constructor(private metricsService: MetricsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, ip } = req;
        const correlationId = (req as any).correlationId || '-';
        const startTime = Date.now();

        this.metricsService.activeConnections.inc();

        return next.handle().pipe(
            tap({
                next: () => {
                    const res = context.switchToHttp().getResponse();
                    const statusCode = res.statusCode;
                    const duration = Date.now() - startTime;
                    const route = this.normalizeRoute(url);

                    // Structured log
                    this.logger.log(
                        `${method} ${url} ${statusCode} ${duration}ms [${correlationId}] ${ip}`,
                    );

                    // Prometheus metrics
                    this.metricsService.httpRequestTotal.inc({
                        method, route, status_code: String(statusCode),
                    });
                    this.metricsService.httpRequestDuration.observe(
                        { method, route, status_code: String(statusCode) },
                        duration / 1000,
                    );

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

                    this.logger.error(
                        `${method} ${url} ${statusCode} ${duration}ms [${correlationId}] ${ip} - ${err.message}`,
                    );

                    this.metricsService.httpRequestTotal.inc({
                        method, route, status_code: String(statusCode),
                    });
                    this.metricsService.httpRequestDuration.observe(
                        { method, route, status_code: String(statusCode) },
                        duration / 1000,
                    );
                    this.metricsService.httpErrorTotal.inc({
                        method, route, status_code: String(statusCode),
                    });

                    this.metricsService.activeConnections.dec();
                },
            }),
        );
    }

    /**
     * Normalize URLs to prevent cardinality explosion in Prometheus.
     * /api/reports/abc-123 → /api/reports/:id
     */
    private normalizeRoute(url: string): string {
        return url
            .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
            .replace(/\/\d+/g, '/:id')
            .split('?')[0]; // Remove query params
    }
}
