import { WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
interface AlertJobData {
    alertId: string;
    category: string;
    severity: string;
    title: string;
    description: string;
    targetUserId?: string;
    sourceIp?: string;
    metadata?: Record<string, any>;
}
export declare class AlertProcessor extends WorkerHost {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    process(job: Job<AlertJobData>): Promise<void>;
    private getChannels;
    private sendSlack;
    private sendEmail;
    private sendPagerDuty;
}
export {};
