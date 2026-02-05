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
exports.CVSSService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CVSSService = class CVSSService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateScore(vector) {
        const impactSubScore = this.calculateImpact(vector);
        const exploitabilitySubScore = this.calculateExploitability(vector);
        let baseScore;
        if (impactSubScore <= 0) {
            baseScore = 0;
        }
        else if (vector.scope === 'U') {
            baseScore = Math.min(impactSubScore + exploitabilitySubScore, 10);
        }
        else {
            baseScore = Math.min(1.08 * (impactSubScore + exploitabilitySubScore), 10);
        }
        baseScore = Math.ceil(baseScore * 10) / 10;
        const severity = this.getSeverity(baseScore);
        const vectorString = this.generateVectorString(vector);
        return {
            baseScore,
            severity,
            vector: vectorString,
        };
    }
    calculateImpact(vector) {
        const confImpact = this.getMetricValue('confidentiality', vector.confidentiality);
        const integImpact = this.getMetricValue('integrity', vector.integrity);
        const availImpact = this.getMetricValue('availability', vector.availability);
        const isc = 1 - ((1 - confImpact) * (1 - integImpact) * (1 - availImpact));
        if (vector.scope === 'U') {
            return 6.42 * isc;
        }
        else {
            return 7.52 * (isc - 0.029) - 3.25 * Math.pow(isc - 0.02, 15);
        }
    }
    calculateExploitability(vector) {
        const av = this.getMetricValue('attackVector', vector.attackVector);
        const ac = this.getMetricValue('attackComplexity', vector.attackComplexity);
        const pr = this.getMetricValue('privilegesRequired', vector.privilegesRequired, vector.scope);
        const ui = this.getMetricValue('userInteraction', vector.userInteraction);
        return 8.22 * av * ac * pr * ui;
    }
    getMetricValue(metric, value, scope) {
        const values = {
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
    getSeverity(score) {
        if (score === 0)
            return 'INFORMATIONAL';
        if (score < 4.0)
            return 'LOW';
        if (score < 7.0)
            return 'MEDIUM';
        if (score < 9.0)
            return 'HIGH';
        return 'CRITICAL';
    }
    generateVectorString(vector) {
        return `CVSS:3.1/AV:${vector.attackVector}/AC:${vector.attackComplexity}/PR:${vector.privilegesRequired}/UI:${vector.userInteraction}/S:${vector.scope}/C:${vector.confidentiality}/I:${vector.integrity}/A:${vector.availability}`;
    }
    parseVectorString(vectorString) {
        try {
            const parts = vectorString.split('/');
            if (parts[0] !== 'CVSS:3.1')
                return null;
            const metrics = {};
            parts.slice(1).forEach(part => {
                const [key, value] = part.split(':');
                metrics[key] = value;
            });
            return {
                attackVector: metrics.AV,
                attackComplexity: metrics.AC,
                privilegesRequired: metrics.PR,
                userInteraction: metrics.UI,
                scope: metrics.S,
                confidentiality: metrics.C,
                integrity: metrics.I,
                availability: metrics.A,
            };
        }
        catch (error) {
            return null;
        }
    }
    async saveToReport(reportId, vector) {
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
};
exports.CVSSService = CVSSService;
exports.CVSSService = CVSSService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CVSSService);
//# sourceMappingURL=cvss.service.js.map