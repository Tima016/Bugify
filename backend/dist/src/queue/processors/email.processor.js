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
exports.EmailProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const email_service_1 = require("../../email/email.service");
let EmailProcessor = class EmailProcessor extends bullmq_1.WorkerHost {
    emailService;
    constructor(emailService) {
        super();
        this.emailService = emailService;
    }
    async process(job) {
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
                    await this.emailService.sendReportStatusUpdate(data.email, data.name, data.reportNumber, data.status, data.message);
                    break;
                case 'payment-confirmation':
                    await this.emailService.sendPaymentConfirmation(data.email, data.name, data.amount, data.transactionRef);
                    break;
                case 'kyc-status':
                    await this.emailService.sendKycStatusUpdate(data.email, data.name, data.status, data.notes);
                    break;
                case 'new-report':
                    await this.emailService.sendNewReportNotification(data.email, data.companyName, data.reportNumber, data.severity);
                    break;
                default:
                    throw new Error(`Unknown email type: ${type}`);
            }
            return { success: true };
        }
        catch (error) {
            console.error(`Failed to send email:`, error);
            throw error;
        }
    }
};
exports.EmailProcessor = EmailProcessor;
exports.EmailProcessor = EmailProcessor = __decorate([
    (0, bullmq_1.Processor)('email'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map