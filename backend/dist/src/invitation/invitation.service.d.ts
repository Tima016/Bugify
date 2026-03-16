import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export declare class InvitationService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateCode;
    createInvitation(companyId: string, createdById: string, data: {
        email?: string;
        role?: UserRole;
        maxUses?: number;
        expiresAt?: Date;
    }): Promise<{
        id: string;
        email: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        companyId: string;
        code: string;
        maxUses: number;
        usedCount: number;
        expiresAt: Date | null;
        isActive: boolean;
        createdById: string;
    }>;
    validateAndUseCode(code: string, email?: string): Promise<{
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            companyName: string;
            taxId: string | null;
            stripeCustomerId: string | null;
            legalName: string;
            websiteUrl: string | null;
            industry: string | null;
            companySize: import(".prisma/client").$Enums.CompanySize | null;
            logoUrl: string | null;
            description: string | null;
            headquartersLocation: string | null;
            foundedYear: number | null;
            verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            verificationDocuments: import("@prisma/client/runtime/library").JsonValue | null;
            billingEmail: string | null;
            supportEmail: string | null;
            securityEmail: string | null;
            paymentMethod: import("@prisma/client/runtime/library").JsonValue | null;
            subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
            subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
            totalPrograms: number;
            totalPaidOut: import("@prisma/client/runtime/library").Decimal;
            averageResponseTime: number | null;
            domainVerifyToken: string | null;
            domainVerifyStatus: import(".prisma/client").$Enums.DomainVerifyStatus;
            domainVerifiedAt: Date | null;
            onboardingRiskScore: number | null;
        };
    } & {
        id: string;
        email: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        companyId: string;
        code: string;
        maxUses: number;
        usedCount: number;
        expiresAt: Date | null;
        isActive: boolean;
        createdById: string;
    }>;
    getCompanyInvitations(companyId: string): Promise<({
        createdBy: {
            id: string;
            email: string;
            username: string;
        };
    } & {
        id: string;
        email: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        companyId: string;
        code: string;
        maxUses: number;
        usedCount: number;
        expiresAt: Date | null;
        isActive: boolean;
        createdById: string;
    })[]>;
    deactivateInvitation(code: string, companyId: string): Promise<{
        id: string;
        email: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        companyId: string;
        code: string;
        maxUses: number;
        usedCount: number;
        expiresAt: Date | null;
        isActive: boolean;
        createdById: string;
    }>;
    getInvitationStats(companyId: string): Promise<{
        total: number;
        active: number;
        used: number;
        expired: number;
    }>;
}
