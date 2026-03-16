import { MetricsService } from './metrics.service';
export declare class MetricsController {
    private metricsService;
    constructor(metricsService: MetricsService);
    getMetrics(): Promise<string>;
}
