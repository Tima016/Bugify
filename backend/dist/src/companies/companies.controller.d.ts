import { CompaniesService } from './companies.service';
export declare class CompaniesController {
    private companiesService;
    constructor(companiesService: CompaniesService);
    getDashboardStats(req: any): Promise<{
        activePrograms: number;
        totalPrograms: number;
        pendingReports: number;
        totalPaid: number;
        avgResolutionTime: string;
    }>;
}
