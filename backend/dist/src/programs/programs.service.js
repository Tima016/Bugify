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
exports.ProgramsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgramsService = class ProgramsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
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
    async findOne(slug) {
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
    async getStats(programId) {
        const stats = await this.prisma.report.groupBy({
            by: ['status', 'severity'],
            where: { programId },
            _count: true,
        });
        return stats;
    }
    async create(companyId, data) {
        let slug = data.programName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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
    async update(id, companyId, data) {
        const program = await this.prisma.program.findUnique({ where: { id } });
        if (!program || program.companyId !== companyId) {
            throw new Error('Program not found or access denied');
        }
        return this.prisma.program.update({
            where: { id },
            data,
        });
    }
    async delete(id, companyId) {
        const program = await this.prisma.program.findUnique({ where: { id } });
        if (!program || program.companyId !== companyId) {
            throw new Error('Program not found or access denied');
        }
        return this.prisma.program.delete({
            where: { id },
        });
    }
    async findByCompany(companyId) {
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
};
exports.ProgramsService = ProgramsService;
exports.ProgramsService = ProgramsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgramsService);
//# sourceMappingURL=programs.service.js.map