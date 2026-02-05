"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const handlebars = __importStar(require("handlebars"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let EmailService = class EmailService {
    configService;
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }
    async sendEmail(options) {
        try {
            const templatePath = path.join(__dirname, '..', '..', 'templates', 'emails', `${options.template}.hbs`);
            const templateSource = fs.readFileSync(templatePath, 'utf-8');
            const template = handlebars.compile(templateSource);
            const html = template(options.context);
            await this.transporter.sendMail({
                from: this.configService.get('EMAIL_FROM'),
                to: options.to,
                subject: options.subject,
                html,
            });
        }
        catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
    async sendWelcomeEmail(email, name) {
        await this.sendEmail({
            to: email,
            subject: 'Welcome to UzSecure Bug Bounty Platform',
            template: 'welcome',
            context: {
                name,
                loginUrl: `${this.configService.get('FRONTEND_URL')}/login`,
            },
        });
    }
    async sendPasswordResetEmail(email, name, resetToken) {
        await this.sendEmail({
            to: email,
            subject: 'Reset Your Password - UzSecure',
            template: 'password-reset',
            context: {
                name,
                resetUrl: `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`,
                expiryTime: '1 hour',
            },
        });
    }
    async sendReportStatusUpdate(email, name, reportNumber, status, message) {
        await this.sendEmail({
            to: email,
            subject: `Report ${reportNumber} Status Update`,
            template: 'report-update',
            context: {
                name,
                reportNumber,
                status,
                message,
                reportUrl: `${this.configService.get('FRONTEND_URL')}/reports/${reportNumber}`,
            },
        });
    }
    async sendPaymentConfirmation(email, name, amount, transactionRef) {
        await this.sendEmail({
            to: email,
            subject: 'Payment Processed - UzSecure',
            template: 'payment-confirmation',
            context: {
                name,
                amount,
                transactionRef,
                dashboardUrl: `${this.configService.get('FRONTEND_URL')}/dashboard`,
            },
        });
    }
    async sendKycStatusUpdate(email, name, status, notes) {
        await this.sendEmail({
            to: email,
            subject: `KYC Verification ${status}`,
            template: 'kyc-status',
            context: {
                name,
                status,
                notes,
                dashboardUrl: `${this.configService.get('FRONTEND_URL')}/dashboard`,
            },
        });
    }
    async sendNewReportNotification(email, companyName, reportNumber, severity) {
        await this.sendEmail({
            to: email,
            subject: `New ${severity} Severity Report Submitted`,
            template: 'new-report',
            context: {
                companyName,
                reportNumber,
                severity,
                reportUrl: `${this.configService.get('FRONTEND_URL')}/company/reports/${reportNumber}`,
            },
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map