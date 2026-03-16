// ============================================
// Alert Notification Processor — Dispatches to Slack/Email/PagerDuty
// Runs in the worker container via BullMQ
// ============================================
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
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

@Processor('alerts')
export class AlertProcessor extends WorkerHost {
    private readonly logger = new Logger(AlertProcessor.name);

    constructor(private configService: ConfigService) {
        super();
    }

    async process(job: Job<AlertJobData>): Promise<void> {
        const { alertId, category, severity, title, description, targetUserId, sourceIp, metadata } = job.data;

        this.logger.log(`Processing alert ${alertId}: [${severity}] ${category} — ${title}`);

        // Determine notification channels based on severity
        const channels = this.getChannels(severity);

        // Dispatch to each channel
        for (const channel of channels) {
            try {
                switch (channel) {
                    case 'slack':
                        await this.sendSlack(job.data);
                        break;
                    case 'email':
                        await this.sendEmail(job.data);
                        break;
                    case 'pagerduty':
                        await this.sendPagerDuty(job.data);
                        break;
                }
            } catch (err) {
                this.logger.error(`Failed to send to ${channel} for alert ${alertId}: ${err}`);
                // Don't throw — continue to other channels
            }
        }
    }

    private getChannels(severity: string): string[] {
        switch (severity) {
            case 'CRITICAL':
                return ['slack', 'email', 'pagerduty'];
            case 'HIGH':
                return ['slack', 'email'];
            case 'MEDIUM':
                return ['slack', 'email'];
            case 'LOW':
                return ['slack'];
            default:
                return ['slack'];
        }
    }

    private async sendSlack(data: AlertJobData): Promise<void> {
        const webhookUrl = this.configService.get('SLACK_SECURITY_WEBHOOK');
        if (!webhookUrl) {
            this.logger.debug('Slack webhook not configured, skipping');
            return;
        }

        const severityEmoji: Record<string, string> = {
            CRITICAL: '🚨',
            HIGH: '🔴',
            MEDIUM: '🟡',
            LOW: '🔵',
        };

        const payload = {
            text: `${severityEmoji[data.severity] || '⚪'} *Security Alert [${data.severity}]*`,
            blocks: [
                {
                    type: 'header',
                    text: { type: 'plain_text', text: `${severityEmoji[data.severity] || ''} ${data.title}` },
                },
                {
                    type: 'section',
                    fields: [
                        { type: 'mrkdwn', text: `*Category:*\n${data.category}` },
                        { type: 'mrkdwn', text: `*Severity:*\n${data.severity}` },
                        { type: 'mrkdwn', text: `*User:*\n${data.targetUserId || 'N/A'}` },
                        { type: 'mrkdwn', text: `*IP:*\n${data.sourceIp || 'N/A'}` },
                    ],
                },
                {
                    type: 'section',
                    text: { type: 'mrkdwn', text: data.description },
                },
                {
                    type: 'context',
                    elements: [
                        { type: 'mrkdwn', text: `Alert ID: \`${data.alertId}\`` },
                    ],
                },
            ],
        };

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        this.logger.debug(`Slack notification sent for alert ${data.alertId}`);
    }

    private async sendEmail(data: AlertJobData): Promise<void> {
        const securityEmail = this.configService.get('SECURITY_TEAM_EMAIL');
        if (!securityEmail) {
            this.logger.debug('Security email not configured, skipping');
            return;
        }

        // In production: use EmailService to send formatted alert email
        // For now: log the intent (EmailService integration is a simple inject)
        this.logger.log(
            `Email alert → ${securityEmail}: [${data.severity}] ${data.title} (alert: ${data.alertId})`,
        );
    }

    private async sendPagerDuty(data: AlertJobData): Promise<void> {
        const pdKey = this.configService.get('PAGERDUTY_ROUTING_KEY');
        if (!pdKey) {
            this.logger.debug('PagerDuty routing key not configured, skipping');
            return;
        }

        const payload = {
            routing_key: pdKey,
            event_action: 'trigger',
            payload: {
                summary: `[Bugify] ${data.title}`,
                source: 'bugify-security',
                severity: data.severity === 'CRITICAL' ? 'critical' : 'error',
                custom_details: {
                    category: data.category,
                    targetUserId: data.targetUserId,
                    sourceIp: data.sourceIp,
                    alertId: data.alertId,
                },
            },
        };

        await fetch('https://events.pagerduty.com/v2/enqueue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        this.logger.log(`PagerDuty event triggered for alert ${data.alertId}`);
    }
}
