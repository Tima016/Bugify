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
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let WebhookService = class WebhookService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registerWebhook(data) {
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
    async triggerWebhook(event, payload) {
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
    async sendWebhook(webhook, event, payload) {
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
            await this.prisma.webhookLog.create({
                data: {
                    webhookId: webhook.id,
                    event,
                    payload,
                    statusCode: response.status,
                    success: response.ok,
                },
            });
        }
        catch (error) {
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
    generateSecret() {
        return require('crypto').randomBytes(32).toString('hex');
    }
    generateSignature(payload, secret) {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        return hmac.digest('hex');
    }
    async retryFailedWebhooks() {
        const failedLogs = await this.prisma.webhookLog.findMany({
            where: {
                success: false,
                attemptedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
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
    async getWebhookLogs(webhookId, limit = 50) {
        return this.prisma.webhookLog.findMany({
            where: { webhookId },
            orderBy: { attemptedAt: 'desc' },
            take: limit,
        });
    }
    async deleteWebhook(id, userId) {
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
};
exports.WebhookService = WebhookService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhookService.prototype, "retryFailedWebhooks", null);
exports.WebhookService = WebhookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhookService);
//# sourceMappingURL=webhooks.service.js.map