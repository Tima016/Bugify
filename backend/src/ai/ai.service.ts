import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface DuplicateResult {
    isDuplicate: boolean;
    similarReports: any[];
    confidence: number;
}

@Injectable()
export class AIService {
    constructor(private prisma: PrismaService) { }

    /**
     * Detect duplicate reports using similarity analysis
     */
    async detectDuplicates(reportId: string): Promise<DuplicateResult> {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });

        if (!report) {
            throw new Error('Report not found');
        }

        // Get all reports from the same program
        const existingReports = await this.prisma.report.findMany({
            where: {
                programId: report.programId,
                id: { not: reportId },
                status: { in: ['TRIAGED', 'ACCEPTED', 'RESOLVED'] },
            },
        });

        // Calculate similarity scores
        const similarities = existingReports.map(existing => ({
            report: existing,
            score: this.calculateSimilarity(report, existing),
        }));

        // Sort by similarity score
        similarities.sort((a, b) => b.score - a.score);

        // Consider duplicates if similarity > 0.8
        const threshold = 0.8;
        const duplicates = similarities.filter(s => s.score > threshold);

        return {
            isDuplicate: duplicates.length > 0,
            similarReports: duplicates.map(d => d.report),
            confidence: duplicates.length > 0 ? duplicates[0].score : 0,
        };
    }

    /**
     * Calculate similarity between two reports
     */
    private calculateSimilarity(report1: any, report2: any): number {
        // Title similarity (Levenshtein distance)
        const titleSim = this.stringSimilarity(
            report1.title.toLowerCase(),
            report2.title.toLowerCase()
        );

        // Description similarity
        const descSim = this.stringSimilarity(
            report1.description.toLowerCase(),
            report2.description.toLowerCase()
        );

        // Severity match
        const severitySim = report1.severity === report2.severity ? 1 : 0;

        // Weighted average
        return (titleSim * 0.4 + descSim * 0.5 + severitySim * 0.1);
    }

    /**
     * Calculate string similarity (Jaccard similarity)
     */
    private stringSimilarity(str1: string, str2: string): number {
        const words1 = new Set(str1.split(/\s+/));
        const words2 = new Set(str2.split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    /**
     * Classify report severity using ML
     */
    async classifyReportSeverity(reportData: {
        title: string;
        description: string;
    }): Promise<string> {
        // Simple keyword-based classification
        const text = `${reportData.title} ${reportData.description}`.toLowerCase();

        const criticalKeywords = ['rce', 'remote code execution', 'sql injection', 'authentication bypass'];
        const highKeywords = ['xss', 'csrf', 'privilege escalation', 'information disclosure'];
        const mediumKeywords = ['open redirect', 'clickjacking', 'missing headers'];

        if (criticalKeywords.some(k => text.includes(k))) {
            return 'CRITICAL';
        } else if (highKeywords.some(k => text.includes(k))) {
            return 'HIGH';
        } else if (mediumKeywords.some(k => text.includes(k))) {
            return 'MEDIUM';
        }

        return 'LOW';
    }

    /**
     * Generate report summary using AI
     */
    async generateSummary(reportText: string): Promise<string> {
        // Extract first 200 characters as summary
        const summary = reportText.substring(0, 200);
        return summary + (reportText.length > 200 ? '...' : '');
    }
}
