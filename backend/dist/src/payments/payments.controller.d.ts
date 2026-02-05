import { PaymentsService } from './payments.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayout(userId: string, dto: CreatePayoutDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PayoutStatus;
        currency: string;
        researcherId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionRef: string | null;
        notes: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        destination: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date | null;
        processedBy: string | null;
    }>;
    getHistory(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PayoutStatus;
        currency: string;
        researcherId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionRef: string | null;
        notes: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        destination: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date | null;
        processedBy: string | null;
    }[]>;
    getBalance(userId: string): Promise<{
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
    } | null>;
    createPaymentIntent(body: {
        amount: number;
    }): Promise<{
        message: string;
    }>;
    getPendingPayouts(): Promise<({
        researcher: {
            email: string;
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PayoutStatus;
        currency: string;
        researcherId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionRef: string | null;
        notes: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        destination: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date | null;
        processedBy: string | null;
    })[]>;
    updatePayoutStatus(id: string, status: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PayoutStatus;
        currency: string;
        researcherId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionRef: string | null;
        notes: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        destination: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date | null;
        processedBy: string | null;
    }>;
}
