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
export declare class BulkPaymentService {
    private prisma;
    private uzPayment;
    constructor(prisma: PrismaService, uzPayment: UzPaymentService);
    processBulkPayments(request: BulkPaymentRequest): Promise<any>;
    generatePaymentReport(startDate: Date, endDate: Date): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        totalPayments: number;
        totalAmount: number;
        payments: ({
            researcher: {
                id: string;
                email: string;
                username: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
            currency: string;
            researcherId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            amountInUzs: import("@prisma/client/runtime/library").Decimal | null;
            taxWithheld: import("@prisma/client/runtime/library").Decimal | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            netAmount: import("@prisma/client/runtime/library").Decimal | null;
            retryCount: number;
            notes: string | null;
            reportId: string;
            paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
            transactionId: string | null;
            invoiceNumber: string | null;
            invoiceUrl: string | null;
            initiatedBy: string | null;
            approvedBy: string | null;
            paidAt: Date | null;
            failureReason: string | null;
        })[];
    }>;
}
export {};
