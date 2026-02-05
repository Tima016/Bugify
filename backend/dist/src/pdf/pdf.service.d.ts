import { PrismaService } from '../prisma/prisma.service';
export declare class PDFService {
    private prisma;
    constructor(prisma: PrismaService);
    generateReportPDF(reportId: string): Promise<string>;
    generateInvoicePDF(paymentId: string): Promise<string>;
}
