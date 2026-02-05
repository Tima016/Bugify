import { ConfigService } from '@nestjs/config';
interface SMSMessage {
    to: string;
    message: string;
}
export declare class SMSService {
    private config;
    constructor(config: ConfigService);
    sendSMS(data: SMSMessage): Promise<boolean>;
    private sendViaPlaymobile;
    private sendViaUMS;
    sendVerificationCode(phone: string, code: string): Promise<boolean>;
    sendPaymentNotification(phone: string, amount: number): Promise<boolean>;
    sendReportUpdate(phone: string, reportId: string, status: string): Promise<boolean>;
}
export {};
