import { PrismaService } from '../prisma/prisma.service';
export declare class CompaniesService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(companyId: string): Promise<{
        activePrograms: number;
        totalPrograms: number;
        pendingReports: number;
        totalPaid: number;
        avgResolutionTime: string;
    }>;
}
