import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UzPaymentService } from './uz-payment.service';

interface BulkPaymentRequest {
    payments: {
        userId: string;
        amount: number;
        reportId?: string;
        description: string;
    }[];
}

@Injectable()
export class BulkPaymentService {
    constructor(
        private prisma: PrismaService,
        private uzPayment: UzPaymentService,
    ) { }

    /**
     * Process bulk payments
     */
    async processBulkPayments(request: BulkPaymentRequest): Promise<any> {
        const results: any[] = [];

        for (const payment of request.payments) {
            try {
                // Create payment record
                const paymentRecord = await this.prisma.payment.create({
                    data: {
                        researcherId: payment.userId,
                        reportId: payment.reportId || '', // Must be provided
                        companyId: '', // Must be provided
                        amount: payment.amount,
                        currency: 'UZS',
                        status: 'PENDING',
                        paymentMethod: 'BANK_TRANSFER',
                    },
                });

                // Process payment (mock - in production would call actual payment API)
                await new Promise(resolve => setTimeout(resolve, 100));

                // Update status
                await this.prisma.payment.update({
                    where: { id: paymentRecord.id },
                    data: { status: 'COMPLETED', paidAt: new Date() },
                });

                results.push({
                    userId: payment.userId,
                    status: 'success',
                    paymentId: paymentRecord.id,
                });
            } catch (error) {
                results.push({
                    userId: payment.userId,
                    status: 'failed',
                    error: error.message,
                });
            }
        }

        return {
            total: request.payments.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length,
            results,
        };
    }

    /**
     * Generate bulk payment report
     */
    async generatePaymentReport(startDate: Date, endDate: Date) {
        const payments = await this.prisma.payment.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED',
            },
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

        const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        return {
            period: { start: startDate, end: endDate },
            totalPayments: payments.length,
            totalAmount,
            payments,
        };
    }
}
