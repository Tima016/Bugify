import { ConfigService } from '@nestjs/config';
export interface EmailOptions {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
}
export declare class EmailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendEmail(options: EmailOptions): Promise<void>;
    sendWelcomeEmail(email: string, name: string): Promise<void>;
    sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void>;
    sendReportStatusUpdate(email: string, name: string, reportNumber: string, status: string, message?: string): Promise<void>;
    sendPaymentConfirmation(email: string, name: string, amount: number, transactionRef: string): Promise<void>;
    sendKycStatusUpdate(email: string, name: string, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<void>;
    sendNewReportNotification(email: string, companyName: string, reportNumber: string, severity: string): Promise<void>;
}
