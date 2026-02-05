import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CVSSVector {
    attackVector: 'N' | 'A' | 'L' | 'P'; // Network, Adjacent, Local, Physical
    attackComplexity: 'L' | 'H'; // Low, High
    privilegesRequired: 'N' | 'L' | 'H'; // None, Low, High
    userInteraction: 'N' | 'R'; // None, Required
    scope: 'U' | 'C'; // Unchanged, Changed
    confidentiality: 'N' | 'L' | 'H'; // None, Low, High
    integrity: 'N' | 'L' | 'H'; // None, Low, High
    availability: 'N' | 'L' | 'H'; // None, Low, High
}

export interface CVSSScore {
    baseScore: number;
    severity: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    vector: string;
}

@Injectable()
export class CVSSService {
    constructor(private prisma: PrismaService) { }

    /**
     * Calculate CVSS v3.1 base score
     */
    calculateScore(vector: CVSSVector): CVSSScore {
        // Impact Sub-Score
        const impactSubScore = this.calculateImpact(vector);

        // Exploitability Sub-Score
        const exploitabilitySubScore = this.calculateExploitability(vector);

        // Base Score
        let baseScore: number;
        if (impactSubScore <= 0) {
            baseScore = 0;
        } else if (vector.scope === 'U') {
            baseScore = Math.min(impactSubScore + exploitabilitySubScore, 10);
        } else {
            baseScore = Math.min(1.08 * (impactSubScore + exploitabilitySubScore), 10);
        }

        // Round up to 1 decimal
        baseScore = Math.ceil(baseScore * 10) / 10;

        // Determine severity
        const severity = this.getSeverity(baseScore);

        // Generate vector string
        const vectorString = this.generateVectorString(vector);

        return {
            baseScore,
            severity,
            vector: vectorString,
        };
    }

    /**
     * Calculate Impact Sub-Score
     */
    private calculateImpact(vector: CVSSVector): number {
        const confImpact = this.getMetricValue('confidentiality', vector.confidentiality);
        const integImpact = this.getMetricValue('integrity', vector.integrity);
        const availImpact = this.getMetricValue('availability', vector.availability);

        const isc = 1 - ((1 - confImpact) * (1 - integImpact) * (1 - availImpact));

        if (vector.scope === 'U') {
            return 6.42 * isc;
        } else {
            return 7.52 * (isc - 0.029) - 3.25 * Math.pow(isc - 0.02, 15);
        }
    }

    /**
     * Calculate Exploitability Sub-Score
     */
    private calculateExploitability(vector: CVSSVector): number {
        const av = this.getMetricValue('attackVector', vector.attackVector);
        const ac = this.getMetricValue('attackComplexity', vector.attackComplexity);
        const pr = this.getMetricValue('privilegesRequired', vector.privilegesRequired, vector.scope);
        const ui = this.getMetricValue('userInteraction', vector.userInteraction);

        return 8.22 * av * ac * pr * ui;
    }

    /**
     * Get metric value
     */
    private getMetricValue(metric: string, value: string, scope?: string): number {
        const values: Record<string, Record<string, number>> = {
            attackVector: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
            attackComplexity: { L: 0.77, H: 0.44 },
            privilegesRequired: {
                N: 0.85,
                L: scope === 'C' ? 0.68 : 0.62,
                H: scope === 'C' ? 0.5 : 0.27,
            },
            userInteraction: { N: 0.85, R: 0.62 },
            confidentiality: { N: 0, L: 0.22, H: 0.56 },
            integrity: { N: 0, L: 0.22, H: 0.56 },
            availability: { N: 0, L: 0.22, H: 0.56 },
        };

        return values[metric][value];
    }

    /**
     * Get severity rating from score
     */
    private getSeverity(score: number): 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
        if (score === 0) return 'INFORMATIONAL';
        if (score < 4.0) return 'LOW';
        if (score < 7.0) return 'MEDIUM';
        if (score < 9.0) return 'HIGH';
        return 'CRITICAL';
    }

    /**
     * Generate CVSS vector string
     */
    private generateVectorString(vector: CVSSVector): string {
        return `CVSS:3.1/AV:${vector.attackVector}/AC:${vector.attackComplexity}/PR:${vector.privilegesRequired}/UI:${vector.userInteraction}/S:${vector.scope}/C:${vector.confidentiality}/I:${vector.integrity}/A:${vector.availability}`;
    }

    /**
     * Parse CVSS vector string
     */
    parseVectorString(vectorString: string): CVSSVector | null {
        try {
            const parts = vectorString.split('/');
            if (parts[0] !== 'CVSS:3.1') return null;

            const metrics: Record<string, string> = {};
            parts.slice(1).forEach(part => {
                const [key, value] = part.split(':');
                metrics[key] = value;
            });

            return {
                attackVector: metrics.AV as any,
                attackComplexity: metrics.AC as any,
                privilegesRequired: metrics.PR as any,
                userInteraction: metrics.UI as any,
                scope: metrics.S as any,
                confidentiality: metrics.C as any,
                integrity: metrics.I as any,
                availability: metrics.A as any,
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Save CVSS score to report
     */
    async saveToReport(reportId: string, vector: CVSSVector) {
        const score = this.calculateScore(vector);

        await this.prisma.report.update({
            where: { id: reportId },
            data: {
                cvssScore: score.baseScore,
                cvssVector: score.vector,
                severity: score.severity,
            },
        });

        return score;
    }
}
