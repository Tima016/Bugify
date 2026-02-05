import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
}

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const templatePath = path.join(
                __dirname,
                '..',
                '..',
                'templates',
                'emails',
                `${options.template}.hbs`,
            );

            const templateSource = fs.readFileSync(templatePath, 'utf-8');
            const template = handlebars.compile(templateSource);
            const html = template(options.context);

            await this.transporter.sendMail({
                from: this.configService.get('EMAIL_FROM'),
                to: options.to,
                subject: options.subject,
                html,
            });
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }

    async sendWelcomeEmail(email: string, name: string): Promise<void> {
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

    async sendPasswordResetEmail(
        email: string,
        name: string,
        resetToken: string,
    ): Promise<void> {
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

    async sendReportStatusUpdate(
        email: string,
        name: string,
        reportNumber: string,
        status: string,
        message?: string,
    ): Promise<void> {
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

    async sendPaymentConfirmation(
        email: string,
        name: string,
        amount: number,
        transactionRef: string,
    ): Promise<void> {
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

    async sendKycStatusUpdate(
        email: string,
        name: string,
        status: 'APPROVED' | 'REJECTED',
        notes?: string,
    ): Promise<void> {
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

    async sendNewReportNotification(
        email: string,
        companyName: string,
        reportNumber: string,
        severity: string,
    ): Promise<void> {
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
}
