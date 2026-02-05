import { PrismaService } from '../prisma/prisma.service';
export interface CVSSVector {
    attackVector: 'N' | 'A' | 'L' | 'P';
    attackComplexity: 'L' | 'H';
    privilegesRequired: 'N' | 'L' | 'H';
    userInteraction: 'N' | 'R';
    scope: 'U' | 'C';
    confidentiality: 'N' | 'L' | 'H';
    integrity: 'N' | 'L' | 'H';
    availability: 'N' | 'L' | 'H';
}
export interface CVSSScore {
    baseScore: number;
    severity: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    vector: string;
}
export declare class CVSSService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateScore(vector: CVSSVector): CVSSScore;
    private calculateImpact;
    private calculateExploitability;
    private getMetricValue;
    private getSeverity;
    private generateVectorString;
    parseVectorString(vectorString: string): CVSSVector | null;
    saveToReport(reportId: string, vector: CVSSVector): Promise<CVSSScore>;
}
