import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats(companyId: string) {
        // Get active programs count
        const activePrograms = await this.prisma.program.count({
            where: {
                companyId,
                status: 'ACTIVE'
            }
        });

        // Get total programs count
        const totalPrograms = await this.prisma.program.count({
            where: { companyId }
        });

        // Get pending reports count (reports needing triage)
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

        // Get total paid out
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

        // Calculate average resolution time
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
}
