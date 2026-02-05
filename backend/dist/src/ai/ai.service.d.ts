import { PrismaService } from '../prisma/prisma.service';
interface DuplicateResult {
    isDuplicate: boolean;
    similarReports: any[];
    confidence: number;
}
export declare class AIService {
    private prisma;
    constructor(prisma: PrismaService);
    detectDuplicates(reportId: string): Promise<DuplicateResult>;
    private calculateSimilarity;
    private stringSimilarity;
    classifyReportSeverity(reportData: {
        title: string;
        description: string;
    }): Promise<string>;
    generateSummary(reportText: string): Promise<string>;
}
export {};
