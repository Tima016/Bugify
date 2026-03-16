import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare enum PaymentProvider {
    UZCARD = "UZCARD",
    HUMO = "HUMO",
    CLICK = "CLICK",
    PAYME = "PAYME"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
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
export declare class UzPaymentService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    initiateUzCardPayment(request: PaymentRequest): Promise<PaymentResponse>;
    initiateHumoPayment(request: PaymentRequest): Promise<PaymentResponse>;
    handlePaymentCallback(provider: PaymentProvider, data: any): Promise<{
        success: boolean;
        status: string;
    }>;
    private generateUzCardSignature;
    private generateHumoSignature;
    private verifyCallbackSignature;
    private callUzCardAPI;
    private callHumoAPI;
    getPaymentStatus(transactionId: string): Promise<({
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
        transactionId: string | null;
        invoiceNumber: string | null;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
        invoiceUrl: string | null;
        initiatedBy: string | null;
        approvedBy: string | null;
        paidAt: Date | null;
        failureReason: string | null;
    }) | null>;
    refundPayment(transactionId: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
