import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WebhookService {
    constructor(private prisma: PrismaService) { }

    /**
     * Register a webhook
     */
    async registerWebhook(data: {
        url: string;
        events: string[];
        userId: string;
        secret?: string;
    }) {
        return this.prisma.webhook.create({
            data: {
                url: data.url,
                events: data.events,
                userId: data.userId,
                secret: data.secret || this.generateSecret(),
                isActive: true,
            },
        });
    }

    /**
     * Trigger webhook for an event
     */
    async triggerWebhook(event: string, payload: any) {
        const webhooks = await this.prisma.webhook.findMany({
            where: {
                isActive: true,
                events: {
                    has: event,
                },
            },
        });

        for (const webhook of webhooks) {
            await this.sendWebhook(webhook, event, payload);
        }
    }

    /**
     * Send webhook HTTP request
     */
    private async sendWebhook(webhook: any, event: string, payload: any) {
        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Event': event,
                    'X-Webhook-Signature': this.generateSignature(payload, webhook.secret),
                },
                body: JSON.stringify({
                    event,
                    timestamp: new Date().toISOString(),
                    data: payload,
                }),
            });

            // Log webhook delivery
            await this.prisma.webhookLog.create({
                data: {
                    webhookId: webhook.id,
                    event,
                    payload,
                    statusCode: response.status,
                    success: response.ok,
                },
            });

            // Webhook delivered successfully
        } catch (error) {
            // Log failed delivery
            await this.prisma.webhookLog.create({
                data: {
                    webhookId: webhook.id,
                    event,
                    payload,
                    statusCode: 0,
                    success: false,
                    error: error.message,
                },
            });
        }
    }

    /**
     * Generate webhook secret
     */
    private generateSecret(): string {
        return require('crypto').randomBytes(32).toString('hex');
    }

    /**
     * Generate HMAC signature
     */
    private generateSignature(payload: any, secret: string): string {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        return hmac.digest('hex');
    }

    /**
     * Retry failed webhooks (runs every hour)
     */
    @Cron(CronExpression.EVERY_HOUR)
    async retryFailedWebhooks() {
        const failedLogs = await this.prisma.webhookLog.findMany({
            where: {
                success: false,
                attemptedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
            },
            include: { webhook: true },
            take: 100,
        });

        for (const log of failedLogs) {
            if (log.webhook.isActive) {
                await this.sendWebhook(log.webhook, log.event, log.payload);
            }
        }
    }

    /**
     * Get webhook logs
     */
    async getWebhookLogs(webhookId: string, limit: number = 50) {
        return this.prisma.webhookLog.findMany({
            where: { webhookId },
            orderBy: { attemptedAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Delete webhook
     */
    async deleteWebhook(id: string, userId: string) {
        const webhook = await this.prisma.webhook.findUnique({
            where: { id },
        });

        if (!webhook) {
            throw new Error('Webhook not found');
        }

        if (webhook.userId !== userId) {
            throw new Error('Unauthorized');
        }

        return this.prisma.webhook.delete({
            where: { id },
        });
    }
}
