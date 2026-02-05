import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from '../../email/email.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
    constructor(private emailService: EmailService) {
        super();
    }

    async process(job: Job): Promise<any> {
        const { type, data } = job.data;

        try {
            switch (type) {
                case 'welcome':
                    await this.emailService.sendWelcomeEmail(data.email, data.name);
                    break;
                case 'password-reset':
                    await this.emailService.sendPasswordResetEmail(data.email, data.name, data.resetToken);
                    break;
                case 'report-update':
                    await this.emailService.sendReportStatusUpdate(
                        data.email,
                        data.name,
                        data.reportNumber,
                        data.status,
                        data.message,
                    );
                    break;
                case 'payment-confirmation':
                    await this.emailService.sendPaymentConfirmation(
                        data.email,
                        data.name,
                        data.amount,
                        data.transactionRef,
                    );
                    break;
                case 'kyc-status':
                    await this.emailService.sendKycStatusUpdate(
                        data.email,
                        data.name,
                        data.status,
                        data.notes,
                    );
                    break;
                case 'new-report':
                    await this.emailService.sendNewReportNotification(
                        data.email,
                        data.companyName,
                        data.reportNumber,
                        data.severity,
                    );
                    break;
                default:
                    throw new Error(`Unknown email type: ${type}`);
            }

            return { success: true };
        } catch (error) {
            console.error(`Failed to send email:`, error);
            throw error;
        }
    }
}
