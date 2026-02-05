import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto, UpdateReportStatusDto } from './dto/report.dto';
import { AIService } from '../ai/ai.service';

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private aiService: AIService,
    ) { }

    async create(userId: string, createReportDto: CreateReportDto) {
        // Generate report number
        const reportCount = await this.prisma.report.count();
        const reportNumber = `RPT-${new Date().getFullYear()}-${String(reportCount + 1).padStart(4, '0')}`;

        const report = await this.prisma.report.create({
            data: {
                reportNumber,
                researcherId: userId,
                programId: createReportDto.programId,
                title: createReportDto.title,
                vulnerabilityType: createReportDto.vulnerabilityType,
                severity: createReportDto.severity as any,
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

        // Trigger AI duplicate detection (async)
        this.aiService.detectDuplicates(report.id).catch(err =>
            console.error('Failed to run duplicate detection:', err)
        );

        return report;
    }

    async findAll(filters?: { status?: string; severity?: string; programId?: string }) {
        const where: any = {};

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

    async findOne(id: string, userId?: string) {
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
            throw new NotFoundException('Report not found');
        }

        return report;
    }

    async findByResearcher(researcherId: string) {
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

    async findByCompany(companyId: string) {
        // Find reports for programs owned by this company
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

    async updateStatus(id: string, userId: string, updateStatusDto: UpdateReportStatusDto) {
        const report = await this.prisma.report.findUnique({
            where: { id },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        const updatedReport = await this.prisma.$transaction(async (tx) => {
            const data: any = {
                status: updateStatusDto.status as any,
                internalNotes: updateStatusDto.internalNotes,
                updatedAt: new Date(),
            };

            // Handle Bounty Awarding
            if (updateStatusDto.bountyAmount || updateStatusDto.bonusAmount) {
                const bounty = Number(updateStatusDto.bountyAmount || 0);
                const bonus = Number(updateStatusDto.bonusAmount || 0);
                const total = bounty + bonus;

                if (total > 0) {
                    data.bountyAmount = bounty;
                    data.bonusAmount = bonus;
                    data.paymentStatus = 'PENDING'; // Or APPROVED depending on workflow
                    data.timeToBounty = Math.floor((Date.now() - report.submittedDate.getTime()) / (1000 * 60 * 60 * 24)); // Days

                    const program = await tx.program.findUnique({ where: { id: report.programId } });

                    // Create Payment Record
                    await tx.payment.create({
                        data: {
                            reportId: id,
                            researcherId: report.researcherId,
                            companyId: program?.companyId || '', // Should ideally exist
                            amount: total,
                            currency: updateStatusDto.currency || 'USD',
                            paymentMethod: 'BANK_TRANSFER', // Default placeholder
                            status: 'PENDING',
                            initiatedBy: userId
                        }
                    });

                    // We could also update user's pending balance here if we tracked it separate from totalEarnings
                    // For now, totalEarnings updates when paymentStatus becomes COMPLETED
                }
            }

            // Set resolved date if resolving
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

    async getStatsByProgram(programId: string) {
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
}
