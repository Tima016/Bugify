import { InvitationService } from './invitation.service';
export declare class InvitationController {
    private invitationService;
    constructor(invitationService: InvitationService);
    createInvitation(req: any, body: any): Promise<{
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
    validateCode(body: {
        code: string;
        email?: string;
    }): Promise<{
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
    getStats(companyId: string): Promise<{
        total: number;
        active: number;
        used: number;
        expired: number;
    }>;
    deactivateInvitation(code: string, req: any): Promise<{
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
}
