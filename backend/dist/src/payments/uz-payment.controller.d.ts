import { UzPaymentService, IPaymentResponse } from './uz-payment.service';
export declare class UzPaymentController {
    private uzPaymentService;
    constructor(uzPaymentService: UzPaymentService);
    initiateUzCard(body: any): Promise<IPaymentResponse>;
    initiateHumo(body: any): Promise<IPaymentResponse>;
    handleCallback(provider: string, body: any): Promise<{
        success: boolean;
        status: string;
    }>;
    getStatus(transactionId: string): Promise<({
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
    }) | null>;
    refund(transactionId: string, body: {
        reason: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
