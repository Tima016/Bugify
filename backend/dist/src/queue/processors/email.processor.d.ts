import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from '../../email/email.service';
export declare class EmailProcessor extends WorkerHost {
    private emailService;
    constructor(emailService: EmailService);
    process(job: Job): Promise<any>;
}
