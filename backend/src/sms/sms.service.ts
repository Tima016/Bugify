import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SMSMessage {
    to: string;
    message: string;
}

@Injectable()
export class SMSService {
    constructor(private config: ConfigService) { }

    /**
     * Send SMS via Uzbekistan provider (Playmobile, UMS, etc.)
     */
    async sendSMS(data: SMSMessage): Promise<boolean> {
        const provider = this.config.get('SMS_PROVIDER') || 'playmobile';

        try {
            if (provider === 'playmobile') {
                return await this.sendViaPlaymobile(data);
            } else if (provider === 'ums') {
                return await this.sendViaUMS(data);
            }

            throw new Error(`Unknown SMS provider: ${provider}`);
        } catch (error) {
            console.error('SMS sending failed:', error);
            return false;
        }
    }

    /**
     * Send via Playmobile (Uzbekistan)
     */
    private async sendViaPlaymobile(data: SMSMessage): Promise<boolean> {
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

    /**
     * Send via UMS (Uzbekistan)
     */
    private async sendViaUMS(data: SMSMessage): Promise<boolean> {
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

    /**
     * Send verification code
     */
    async sendVerificationCode(phone: string, code: string): Promise<boolean> {
        return this.sendSMS({
            to: phone,
            message: `UzSecure verification code: ${code}. Do not share this code.`,
        });
    }

    /**
     * Send payment notification
     */
    async sendPaymentNotification(phone: string, amount: number): Promise<boolean> {
        return this.sendSMS({
            to: phone,
            message: `Payment of ${amount} UZS has been processed. Thank you for using UzSecure!`,
        });
    }

    /**
     * Send report status update
     */
    async sendReportUpdate(phone: string, reportId: string, status: string): Promise<boolean> {
        return this.sendSMS({
            to: phone,
            message: `Your report #${reportId} status: ${status}. Check UzSecure for details.`,
        });
    }
}
