import { PrismaService } from '../prisma/prisma.service';
export declare class CompanyVerificationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    isDisposableEmail(email: string): boolean;
    isFreeEmail(email: string): boolean;
    validateCompanyEmail(email: string): {
        valid: boolean;
        warning?: string;
    };
    initiateDomainVerification(companyId: string, domain: string): Promise<{
        instructions: string;
        record: {
            type: string;
            host: string;
            value: string;
        };
        expiresIn: string;
    }>;
    checkDomainVerification(companyId: string): Promise<boolean>;
    calculateOnboardingRisk(companyId: string): Promise<number>;
}
