import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgramsService {
    constructor(private prisma: PrismaService) { }

    async findAll(filters?: { status?: string; programType?: string; search?: string }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status.toUpperCase();
        }

        if (filters?.programType) {
            where.programType = filters.programType.toUpperCase();
        }

        if (filters?.search) {
            where.OR = [
                { programName: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const programs = await this.prisma.program.findMany({
            where,
            include: {
                company: {
                    select: {
                        id: true,
                        companyName: true,
                        logoUrl: true,
                        industry: true,
                        websiteUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return programs;
    }

    async findOne(slug: string) {
        const program = await this.prisma.program.findUnique({
            where: { slug },
            include: {
                company: {
                    select: {
                        id: true,
                        companyName: true,
                        legalName: true,
                        logoUrl: true,
                        industry: true,
                        websiteUrl: true,
                        totalPaidOut: true,
                        averageResponseTime: true,
                    },
                },
                _count: {
                    select: {
                        reports: true,
                    },
                },
            },
        });

        return program;
    }

    async getStats(programId: string) {
        const stats = await this.prisma.report.groupBy({
            by: ['status', 'severity'],
            where: { programId },
            _count: true,
        });

        return stats;
    }

    async create(companyId: string, data: any) {
        // Generate a slug from program name
        let slug = data.programName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        // Ensure slug uniqueness
        const existing = await this.prisma.program.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        return this.prisma.program.create({
            data: {
                ...data,
                companyId,
                slug,
            },
        });
    }

    async update(id: string, companyId: string, data: any) {
        // Verify ownership
        const program = await this.prisma.program.findUnique({ where: { id } });
        if (!program || program.companyId !== companyId) {
            throw new Error('Program not found or access denied');
        }

        return this.prisma.program.update({
            where: { id },
            data,
        });
    }

    async delete(id: string, companyId: string) {
        const program = await this.prisma.program.findUnique({ where: { id } });
        if (!program || program.companyId !== companyId) {
            throw new Error('Program not found or access denied');
        }

        // Soft delete or status change is safer, but implementing physical delete for now
        // Assuming cascade delete is set up in schema, otherwise might need transaction
        return this.prisma.program.delete({
            where: { id },
        });
    }

    async findByCompany(companyId: string) {
        return this.prisma.program.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { reports: true }
                }
            }
        });
    }
}
