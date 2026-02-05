import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export enum PaymentProvider {
    UZCARD = 'UZCARD',
    HUMO = 'HUMO',
    CLICK = 'CLICK',
    PAYME = 'PAYME',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

interface PaymentRequest {
    amount: number;
    currency: string;
    description: string;
    userId: string;
    provider: PaymentProvider;
    cardNumber?: string;
    expiryDate?: string;
}

interface PaymentResponse {
    transactionId: string;
    status: PaymentStatus;
    redirectUrl?: string;
    message?: string;
}

export interface IPaymentResponse {
    transactionId: string;
    status: PaymentStatus;
    redirectUrl?: string;
    message?: string;
}

@Injectable()
export class UzPaymentService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) { }

    /**
     * Initialize payment with UzCard
     */
    async initiateUzCardPayment(request: PaymentRequest): Promise<PaymentResponse> {
        const merchantId = this.config.get('UZCARD_MERCHANT_ID');
        const secretKey = this.config.get('UZCARD_SECRET_KEY');

        // Create payment record
        const payment = await this.prisma.payment.create({
            data: {
                researcherId: request.userId,
                reportId: '', // Should be provided in request
                companyId: '', // Should be provided in request
                amount: request.amount,
                currency: request.currency || 'UZS',
                status: 'PENDING',
                paymentMethod: 'UZCARD',
            },
        });

        // Generate signature for UzCard API
        const signature = this.generateUzCardSignature({
            merchantId,
            amount: request.amount,
            orderId: payment.id,
            secretKey,
        });

        // Prepare UzCard payment request
        const uzCardRequest = {
            merchant_id: merchantId,
            amount: request.amount * 100, // Convert to tiyin
            order_id: payment.id,
            description: request.description,
            return_url: `${this.config.get('FRONTEND_URL')}/payment/callback`,
            signature,
        };

        try {
            // Call UzCard API (mock implementation)
            const response = await this.callUzCardAPI(uzCardRequest);

            // Update payment with transaction ID
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    transactionId: response.transaction_id,
                    status: 'PROCESSING',
                },
            });

            return {
                transactionId: response.transaction_id,
                status: PaymentStatus.PROCESSING,
                redirectUrl: response.redirect_url,
            };
        } catch (error) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' },
            });

            throw new BadRequestException('UzCard payment initialization failed');
        }
    }

    /**
     * Initialize payment with Humo
     */
    async initiateHumoPayment(request: PaymentRequest): Promise<PaymentResponse> {
        const merchantId = this.config.get('HUMO_MERCHANT_ID');
        const secretKey = this.config.get('HUMO_SECRET_KEY');

        // Create payment record
        const payment = await this.prisma.payment.create({
            data: {
                researcherId: request.userId,
                reportId: '', // Should be provided in request
                companyId: '', // Should be provided in request
                amount: request.amount,
                currency: request.currency || 'UZS',
                status: 'PENDING',
                paymentMethod: 'HUMO',
            },
        });

        // Generate signature for Humo API
        const signature = this.generateHumoSignature({
            merchantId,
            amount: request.amount,
            orderId: payment.id,
            secretKey,
        });

        // Prepare Humo payment request
        const humoRequest = {
            merchant_id: merchantId,
            amount: request.amount * 100, // Convert to tiyin
            order_id: payment.id,
            description: request.description,
            return_url: `${this.config.get('FRONTEND_URL')}/payment/callback`,
            signature,
        };

        try {
            // Call Humo API (mock implementation)
            const response = await this.callHumoAPI(humoRequest);

            // Update payment with transaction ID
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    transactionId: response.transaction_id,
                    status: 'PROCESSING',
                },
            });

            return {
                transactionId: response.transaction_id,
                status: PaymentStatus.PROCESSING,
                redirectUrl: response.redirect_url,
            };
        } catch (error) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' },
            });

            throw new BadRequestException('Humo payment initialization failed');
        }
    }

    /**
     * Handle payment callback from UzCard/Humo
     */
    async handlePaymentCallback(provider: PaymentProvider, data: any) {
        const payment = await this.prisma.payment.findFirst({
            where: { transactionId: data.transaction_id },
        });

        if (!payment) {
            throw new BadRequestException('Payment not found');
        }

        // Verify signature
        const isValid = this.verifyCallbackSignature(provider, data);
        if (!isValid) {
            throw new BadRequestException('Invalid signature');
        }

        // Update payment status
        const status = data.status === 'success' ? 'COMPLETED' : 'FAILED';
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status,
                paidAt: status === 'COMPLETED' ? new Date() : null,
            },
        });

        // If payment is for a bounty, update report
        if (payment.reportId) {
            await this.prisma.report.update({
                where: { id: payment.reportId },
                data: {
                    paymentStatus: status === 'COMPLETED' ? 'PAID' : 'PENDING',
                },
            });
        }

        return { success: true, status };
    }

    /**
     * Generate UzCard signature
     */
    private generateUzCardSignature(params: {
        merchantId: string;
        amount: number;
        orderId: string;
        secretKey: string;
    }): string {
        const data = `${params.merchantId}${params.amount}${params.orderId}${params.secretKey}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Generate Humo signature
     */
    private generateHumoSignature(params: {
        merchantId: string;
        amount: number;
        orderId: string;
        secretKey: string;
    }): string {
        const data = `${params.merchantId}${params.amount}${params.orderId}${params.secretKey}`;
        return crypto.createHash('md5').update(data).digest('hex');
    }

    /**
     * Verify callback signature
     */
    private verifyCallbackSignature(provider: PaymentProvider, data: any): boolean {
        const secretKey =
            provider === PaymentProvider.UZCARD
                ? this.config.get('UZCARD_SECRET_KEY')
                : this.config.get('HUMO_SECRET_KEY');

        const expectedSignature =
            provider === PaymentProvider.UZCARD
                ? this.generateUzCardSignature({
                    merchantId: data.merchant_id,
                    amount: data.amount,
                    orderId: data.order_id,
                    secretKey,
                })
                : this.generateHumoSignature({
                    merchantId: data.merchant_id,
                    amount: data.amount,
                    orderId: data.order_id,
                    secretKey,
                });

        return expectedSignature === data.signature;
    }

    /**
     * Call UzCard API (mock implementation)
     */
    private async callUzCardAPI(request: any): Promise<any> {
        // In production, this would make an actual HTTP request to UzCard API
        // For now, return a mock response
        return {
            transaction_id: `UZCARD_${Date.now()}`,
            redirect_url: `https://uzcard.uz/payment/${request.order_id}`,
            status: 'pending',
        };
    }

    /**
     * Call Humo API (mock implementation)
     */
    private async callHumoAPI(request: any): Promise<any> {
        // In production, this would make an actual HTTP request to Humo API
        // For now, return a mock response
        return {
            transaction_id: `HUMO_${Date.now()}`,
            redirect_url: `https://humocard.uz/payment/${request.order_id}`,
            status: 'pending',
        };
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(transactionId: string) {
        return this.prisma.payment.findFirst({
            where: { transactionId },
            include: {
                researcher: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }

    /**
     * Refund payment
     */
    async refundPayment(transactionId: string, reason: string) {
        const payment = await this.prisma.payment.findFirst({
            where: { transactionId },
        });

        if (!payment) {
            throw new BadRequestException('Payment not found');
        }

        if (payment.status !== 'COMPLETED') {
            throw new BadRequestException('Only completed payments can be refunded');
        }

        // In production, call the payment provider's refund API
        // For now, just update the status
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'CANCELLED',
                notes: `Refund: ${reason}`,
            },
        });

        return { success: true, message: 'Payment refunded successfully' };
    }
}
