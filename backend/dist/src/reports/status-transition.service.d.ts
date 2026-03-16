import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';
export interface TransitionParams {
    reportId: string;
    oldStatus: ReportStatus;
    newStatus: ReportStatus;
    changedBy: string;
    reason?: string;
    metadata?: Record<string, any>;
}
export declare class StatusTransitionService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    transition(params: TransitionParams): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        reportNumber: string;
        programId: string;
        researcherId: string;
        title: string;
        vulnerabilityType: string;
        severity: import(".prisma/client").$Enums.Severity;
        cvssScore: import("@prisma/client/runtime/library").Decimal | null;
        cvssVector: string | null;
        impactAnalysis: string;
        reproductionSteps: string;
        proofOfConcept: string | null;
        attachments: import("@prisma/client/runtime/library").JsonValue | null;
        affectedAssets: import("@prisma/client/runtime/library").JsonValue | null;
        discoveredDate: Date;
        submittedDate: Date;
        triageStatus: import(".prisma/client").$Enums.TriageStatus;
        priority: import(".prisma/client").$Enums.Priority | null;
        bountyAmount: import("@prisma/client/runtime/library").Decimal | null;
        bonusAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        paymentDate: Date | null;
        assignedTo: string | null;
        collaborators: import("@prisma/client/runtime/library").JsonValue | null;
        isDisclosed: boolean;
        disclosedAt: Date | null;
        publicDisclosureUrl: string | null;
        duplicateOf: string | null;
        weaknessCwe: string | null;
        weaknessOwasp: string | null;
        retestRequested: boolean;
        retestStatus: import(".prisma/client").$Enums.RetestStatus | null;
        researcherImpactRating: number | null;
        companyImpactRating: number | null;
        timeToTriage: number | null;
        timeToResolution: number | null;
        timeToBounty: number | null;
        internalNotes: string | null;
        tags: string[];
        customFields: import("@prisma/client/runtime/library").JsonValue | null;
        resolvedAt: Date | null;
    }>;
    getHistory(reportId: string): Promise<({
        user: {
            id: string;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        reportId: string;
        reason: string | null;
        oldStatus: import(".prisma/client").$Enums.ReportStatus;
        newStatus: import(".prisma/client").$Enums.ReportStatus;
        changedBy: string;
    })[]>;
}
