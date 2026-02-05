import { PrismaService } from '../prisma/prisma.service';
export declare class InvoicesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, amount: number, items: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        dueDate: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
    }>;
    generatePdf(invoiceId: string): Promise<Buffer>;
}
