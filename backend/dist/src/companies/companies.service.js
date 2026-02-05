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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CompaniesService = class CompaniesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(companyId) {
        const activePrograms = await this.prisma.program.count({
            where: {
                companyId,
                status: 'ACTIVE'
            }
        });
        const totalPrograms = await this.prisma.program.count({
            where: { companyId }
        });
        const pendingReports = await this.prisma.report.count({
            where: {
                program: {
                    companyId
                },
                status: {
                    in: ['NEW', 'TRIAGED', 'NEEDS_MORE_INFO']
                }
            }
        });
        const payments = await this.prisma.payment.aggregate({
            where: {
                companyId,
                status: 'COMPLETED'
            },
            _sum: {
                amount: true
            }
        });
        const totalPaid = Number(payments._sum.amount || 0);
        const resolvedReports = await this.prisma.report.findMany({
            where: {
                program: {
                    companyId
                },
                status: 'RESOLVED',
                timeToResolution: {
                    not: null
                }
            },
            select: {
                timeToResolution: true
            }
        });
        let avgResolutionTime = '0 days';
        if (resolvedReports.length > 0) {
            const totalHours = resolvedReports.reduce((sum, r) => sum + (r.timeToResolution || 0), 0);
            const avgHours = totalHours / resolvedReports.length;
            const avgDays = Math.round(avgHours / 24);
            avgResolutionTime = `${avgDays} day${avgDays !== 1 ? 's' : ''}`;
        }
        return {
            activePrograms,
            totalPrograms,
            pendingReports,
            totalPaid,
            avgResolutionTime
        };
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map