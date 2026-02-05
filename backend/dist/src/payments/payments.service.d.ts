import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    createPayoutRequest(userId: string, dto: CreatePayoutDto): Promise<{
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
    getMyPayouts(userId: string): Promise<{
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
    findAllPayoutRequests(): Promise<({
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
