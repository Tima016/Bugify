"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AIService = class AIService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async detectDuplicates(reportId) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new Error('Report not found');
        }
        const existingReports = await this.prisma.report.findMany({
            where: {
                programId: report.programId,
                id: { not: reportId },
                status: { in: ['TRIAGED', 'ACCEPTED', 'RESOLVED'] },
            },
        });
        const similarities = existingReports.map(existing => ({
            report: existing,
            score: this.calculateSimilarity(report, existing),
        }));
        similarities.sort((a, b) => b.score - a.score);
        const threshold = 0.8;
        const duplicates = similarities.filter(s => s.score > threshold);
        return {
            isDuplicate: duplicates.length > 0,
            similarReports: duplicates.map(d => d.report),
            confidence: duplicates.length > 0 ? duplicates[0].score : 0,
        };
    }
    calculateSimilarity(report1, report2) {
        const titleSim = this.stringSimilarity(report1.title.toLowerCase(), report2.title.toLowerCase());
        const descSim = this.stringSimilarity(report1.description.toLowerCase(), report2.description.toLowerCase());
        const severitySim = report1.severity === report2.severity ? 1 : 0;
        return (titleSim * 0.4 + descSim * 0.5 + severitySim * 0.1);
    }
    stringSimilarity(str1, str2) {
        const words1 = new Set(str1.split(/\s+/));
        const words2 = new Set(str2.split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    async classifyReportSeverity(reportData) {
        const text = `${reportData.title} ${reportData.description}`.toLowerCase();
        const criticalKeywords = ['rce', 'remote code execution', 'sql injection', 'authentication bypass'];
        const highKeywords = ['xss', 'csrf', 'privilege escalation', 'information disclosure'];
        const mediumKeywords = ['open redirect', 'clickjacking', 'missing headers'];
        if (criticalKeywords.some(k => text.includes(k))) {
            return 'CRITICAL';
        }
        else if (highKeywords.some(k => text.includes(k))) {
            return 'HIGH';
        }
        else if (mediumKeywords.some(k => text.includes(k))) {
            return 'MEDIUM';
        }
        return 'LOW';
    }
    async generateSummary(reportText) {
        const summary = reportText.substring(0, 200);
        return summary + (reportText.length > 200 ? '...' : '');
    }
};
exports.AIService = AIService;
exports.AIService = AIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AIService);
//# sourceMappingURL=ai.service.js.map