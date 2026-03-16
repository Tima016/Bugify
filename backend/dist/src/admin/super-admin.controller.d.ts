import { PrismaService } from '../prisma/prisma.service';
import { AlertService } from '../common/security/alert.service';
import { FraudEngine } from '../common/security/fraud-engine.service';
import { MetricsService } from '../common/metrics/metrics.service';
export declare class SuperAdminController {
    private prisma;
    private alertService;
    private fraudEngine;
    private metricsService;
    constructor(prisma: PrismaService, alertService: AlertService, fraudEngine: FraudEngine, metricsService: MetricsService);
    getOverview(): Promise<{
        users: {
            total: number;
            researchers: number;
            companies: number;
        };
        programs: {
            active: number;
        };
        reports: {
            thisMonth: number;
        };
        security: {
            openAlerts: number;
        };
    }>;
    listUsers(role?: string, status?: string, search?: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            email: string;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
            isBanned: boolean;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            createdAt: Date;
            _count: {
                reports: number;
                payoutRequests: number;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    banUser(userId: string, reason: string, admin: any): Promise<{
        message: string;
        userId: string;
    }>;
    unbanUser(userId: string, admin: any): Promise<{
        message: string;
        userId: string;
    }>;
    listPrograms(status?: string, type?: string, page?: string, limit?: string): Promise<{
        data: ({
            company: {
                companyName: string;
            };
            _count: {
                reports: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            companyId: string;
            description: string;
            totalPaidOut: import("@prisma/client/runtime/library").Decimal;
            slug: string;
            programName: string;
            programType: import(".prisma/client").$Enums.ProgramType;
            status: import(".prisma/client").$Enums.ProgramStatus;
            launchDate: Date;
            scope: import("@prisma/client/runtime/library").JsonValue;
            outOfScope: import("@prisma/client/runtime/library").JsonValue | null;
            targetTypes: string[];
            vulnerabilityTypes: string[];
            responseEfficiency: import("@prisma/client/runtime/library").JsonValue | null;
            rulesAndGuidelines: string | null;
            safeHarborPolicy: string | null;
            disclosurePolicy: import(".prisma/client").$Enums.DisclosurePolicy;
            disclosureTimeline: number | null;
            rewardStructure: import("@prisma/client/runtime/library").JsonValue | null;
            minimumPayout: import("@prisma/client/runtime/library").Decimal;
            maximumPayout: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            averagePayout: import("@prisma/client/runtime/library").Decimal | null;
            hallOfFameEnabled: boolean;
            swagRewardsAvailable: boolean;
            totalReportsReceived: number;
            totalValidReports: number;
            averageTriageTime: number | null;
            averageResolutionTime: number | null;
            researcherRating: import("@prisma/client/runtime/library").Decimal | null;
            managedBy: string | null;
            teamMembers: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    pauseProgram(programId: string, reason: string, admin: any): Promise<{
        message: string;
        programId: string;
    }>;
    resumeProgram(programId: string, admin: any): Promise<{
        message: string;
        programId: string;
    }>;
    listPayouts(status?: string, page?: string, limit?: string): Promise<{
        data: ({
            researcher: {
                email: string;
                username: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PayoutStatus;
            currency: string;
            researcherId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            transactionRef: string | null;
            notes: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            destination: import("@prisma/client/runtime/library").JsonValue;
            processedAt: Date | null;
            processedBy: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    freezePayout(payoutId: string, reason: string, admin: any): Promise<{
        message: string;
        payoutId: string;
    }>;
    getSecurityAlerts(severity?: string, category?: string, status?: string, limit?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import(".prisma/client").$Enums.AlertStatus;
        title: string;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        resolvedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        category: import(".prisma/client").$Enums.AlertCategory;
        targetUserId: string | null;
        sourceIp: string | null;
        cooldownKey: string | null;
        resolvedBy: string | null;
    }[]>;
    resolveAlert(alertId: string, reason: string, resolveStatus: 'RESOLVED' | 'FALSE_POSITIVE', admin: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import(".prisma/client").$Enums.AlertStatus;
        title: string;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        resolvedAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        category: import(".prisma/client").$Enums.AlertCategory;
        targetUserId: string | null;
        sourceIp: string | null;
        cooldownKey: string | null;
        resolvedBy: string | null;
    }>;
    getSecurityStats(): Promise<{
        bySeverity: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SecurityAlertGroupByOutputType, "severity"[]> & {
            _count: number;
        })[];
        byCategory: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SecurityAlertGroupByOutputType, "category"[]> & {
            _count: number;
        })[];
    }>;
    getSystemMetrics(): Promise<{
        format: string;
        data: string;
    }>;
    getAuditLog(action?: string, userId?: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            severity: import(".prisma/client").$Enums.LogSeverity;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string | null;
            success: boolean;
            action: string;
            resourceType: string;
            resourceId: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            changes: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
