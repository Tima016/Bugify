import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';
export declare class HttpLoggingInterceptor implements NestInterceptor {
    private metricsService;
    private readonly logger;
    constructor(metricsService: MetricsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private normalizeRoute;
}
