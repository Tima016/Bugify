import { PrismaService } from '../prisma/prisma.service';
export interface CreatePayoutParams {
    userId: string;
    reportId: string;
    amount: number;
    currency?: string;
    description?: string;
    createdBy: string;
}
export declare class LedgerService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    executeReportPayout(params: CreatePayoutParams): Promise<string>;
    private getAccountBalance;
    getAccountHistory(accountId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        currency: string;
        type: import(".prisma/client").$Enums.LedgerType;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdBy: string | null;
        transactionId: string;
        accountId: string;
        referenceType: string;
        balanceAfter: import("@prisma/client/runtime/library").Decimal | null;
        referenceId: string;
    }[]>;
    getTransaction(transactionId: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        currency: string;
        type: import(".prisma/client").$Enums.LedgerType;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdBy: string | null;
        transactionId: string;
        accountId: string;
        referenceType: string;
        balanceAfter: import("@prisma/client/runtime/library").Decimal | null;
        referenceId: string;
    }[]>;
}
