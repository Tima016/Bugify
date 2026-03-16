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
var AlertProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AlertProcessor = AlertProcessor_1 = class AlertProcessor extends bullmq_1.WorkerHost {
    configService;
    logger = new common_1.Logger(AlertProcessor_1.name);
    constructor(configService) {
        super();
        this.configService = configService;
    }
    async process(job) {
        const { alertId, category, severity, title, description, targetUserId, sourceIp, metadata } = job.data;
        this.logger.log(`Processing alert ${alertId}: [${severity}] ${category} — ${title}`);
        const channels = this.getChannels(severity);
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
            }
            catch (err) {
                this.logger.error(`Failed to send to ${channel} for alert ${alertId}: ${err}`);
            }
        }
    }
    getChannels(severity) {
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
    async sendSlack(data) {
        const webhookUrl = this.configService.get('SLACK_SECURITY_WEBHOOK');
        if (!webhookUrl) {
            this.logger.debug('Slack webhook not configured, skipping');
            return;
        }
        const severityEmoji = {
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
    async sendEmail(data) {
        const securityEmail = this.configService.get('SECURITY_TEAM_EMAIL');
        if (!securityEmail) {
            this.logger.debug('Security email not configured, skipping');
            return;
        }
        this.logger.log(`Email alert → ${securityEmail}: [${data.severity}] ${data.title} (alert: ${data.alertId})`);
    }
    async sendPagerDuty(data) {
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
};
exports.AlertProcessor = AlertProcessor;
exports.AlertProcessor = AlertProcessor = AlertProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('alerts'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AlertProcessor);
//# sourceMappingURL=alert.processor.js.map