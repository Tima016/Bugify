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
exports.SMSService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SMSService = class SMSService {
    config;
    constructor(config) {
        this.config = config;
    }
    async sendSMS(data) {
        const provider = this.config.get('SMS_PROVIDER') || 'playmobile';
        try {
            if (provider === 'playmobile') {
                return await this.sendViaPlaymobile(data);
            }
            else if (provider === 'ums') {
                return await this.sendViaUMS(data);
            }
            throw new Error(`Unknown SMS provider: ${provider}`);
        }
        catch (error) {
            console.error('SMS sending failed:', error);
            return false;
        }
    }
    async sendViaPlaymobile(data) {
        const apiKey = this.config.get('PLAYMOBILE_API_KEY');
        const sender = this.config.get('SMS_SENDER') || 'UzSecure';
        const response = await fetch('https://api.playmobile.uz/v1/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                sender,
                recipient: data.to,
                message: data.message,
            }),
        });
        return response.ok;
    }
    async sendViaUMS(data) {
        const login = this.config.get('UMS_LOGIN');
        const password = this.config.get('UMS_PASSWORD');
        const response = await fetch('https://api.ums.uz/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login,
                password,
                data: [{
                        phone: data.to,
                        text: data.message,
                    }],
            }),
        });
        return response.ok;
    }
    async sendVerificationCode(phone, code) {
        return this.sendSMS({
            to: phone,
            message: `UzSecure verification code: ${code}. Do not share this code.`,
        });
    }
    async sendPaymentNotification(phone, amount) {
        return this.sendSMS({
            to: phone,
            message: `Payment of ${amount} UZS has been processed. Thank you for using UzSecure!`,
        });
    }
    async sendReportUpdate(phone, reportId, status) {
        return this.sendSMS({
            to: phone,
            message: `Your report #${reportId} status: ${status}. Check UzSecure for details.`,
        });
    }
};
exports.SMSService = SMSService;
exports.SMSService = SMSService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SMSService);
//# sourceMappingURL=sms.service.js.map