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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let ReportsService = class ReportsService {
    prisma;
    aiService;
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async create(userId, createReportDto) {
        const reportCount = await this.prisma.report.count();
        const reportNumber = `RPT-${new Date().getFullYear()}-${String(reportCount + 1).padStart(4, '0')}`;
        const report = await this.prisma.report.create({
            data: {
                reportNumber,
                researcherId: userId,
                programId: createReportDto.programId,
                title: createReportDto.title,
                vulnerabilityType: createReportDto.vulnerabilityType,
                severity: createReportDto.severity,
                cvssScore: createReportDto.cvssScore,
                cvssVector: createReportDto.cvssVector,
                description: createReportDto.description,
                impactAnalysis: createReportDto.impactAnalysis,
                reproductionSteps: createReportDto.reproductionSteps,
                proofOfConcept: createReportDto.proofOfConcept,
                discoveredDate: new Date(createReportDto.discoveredDate),
                tags: createReportDto.tags || [],
            },
            include: {
                program: {
                    include: {
                        company: true,
                    },
                },
                researcher: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });
        this.aiService.detectDuplicates(report.id).catch(err => console.error('Failed to run duplicate detection:', err));
        return report;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.status) {
            where.status = filters.status.toUpperCase();
        }
        if (filters?.severity) {
            where.severity = filters.severity.toUpperCase();
        }
        if (filters?.programId) {
            where.programId = filters.programId;
        }
        const reports = await this.prisma.report.findMany({
            where,
            include: {
                program: {
                    select: {
                        id: true,
                        programName: true,
                        slug: true,
                        company: {
                            select: {
                                companyName: true,
                                logoUrl: true,
                            },
                        },
                    },
                },
                researcher: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePictureUrl: true,
                        reputationScore: true,
                    },
                },
            },
            orderBy: {
                submittedDate: 'desc',
            },
        });
        return reports;
    }
    async findOne(id, userId) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: {
                program: {
                    include: {
                        company: true,
                    },
                },
                researcher: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePictureUrl: true,
                        reputationScore: true,
                        totalEarnings: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                profilePictureUrl: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async findByResearcher(researcherId) {
        const reports = await this.prisma.report.findMany({
            where: { researcherId },
            include: {
                program: {
                    select: {
                        programName: true,
                        slug: true,
                        company: {
                            select: {
                                companyName: true,
                                logoUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                submittedDate: 'desc',
            },
        });
        return reports;
    }
    async findByCompany(companyId) {
        const reports = await this.prisma.report.findMany({
            where: {
                program: {
                    companyId: companyId
                }
            },
            include: {
                program: {
                    select: {
                        id: true,
                        programName: true,
                        slug: true
                    }
                },
                researcher: {
                    select: {
                        id: true,
                        username: true,
                        reputationScore: true,
                        profilePictureUrl: true
                    }
                }
            },
            orderBy: {
                submittedDate: 'desc'
            }
        });
        return reports;
    }
    async updateStatus(id, userId, updateStatusDto) {
        const report = await this.prisma.report.findUnique({
            where: { id },
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        const updatedReport = await this.prisma.$transaction(async (tx) => {
            const data = {
                status: updateStatusDto.status,
                internalNotes: updateStatusDto.internalNotes,
                updatedAt: new Date(),
            };
            if (updateStatusDto.bountyAmount || updateStatusDto.bonusAmount) {
                const bounty = Number(updateStatusDto.bountyAmount || 0);
                const bonus = Number(updateStatusDto.bonusAmount || 0);
                const total = bounty + bonus;
                if (total > 0) {
                    data.bountyAmount = bounty;
                    data.bonusAmount = bonus;
                    data.paymentStatus = 'PENDING';
                    data.timeToBounty = Math.floor((Date.now() - report.submittedDate.getTime()) / (1000 * 60 * 60 * 24));
                    const program = await tx.program.findUnique({ where: { id: report.programId } });
                    await tx.payment.create({
                        data: {
                            reportId: id,
                            researcherId: report.researcherId,
                            companyId: program?.companyId || '',
                            amount: total,
                            currency: updateStatusDto.currency || 'USD',
                            paymentMethod: 'BANK_TRANSFER',
                            status: 'PENDING',
                            initiatedBy: userId
                        }
                    });
                }
            }
            if (updateStatusDto.status === 'RESOLVED' && report.status !== 'RESOLVED') {
                data.resolvedAt = new Date();
                data.timeToResolution = Math.floor((Date.now() - report.submittedDate.getTime()) / (1000 * 60 * 60 * 24));
            }
            return tx.report.update({
                where: { id },
                data,
                include: {
                    program: true,
                    researcher: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
        });
        return updatedReport;
    }
    async getStatsByProgram(programId) {
        const stats = await this.prisma.report.groupBy({
            by: ['status', 'severity'],
            where: { programId },
            _count: true,
        });
        const totalReports = await this.prisma.report.count({
            where: { programId },
        });
        return {
            totalReports,
            breakdown: stats,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map