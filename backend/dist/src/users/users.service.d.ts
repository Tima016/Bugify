import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    findOne(id: string): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        countryCode: string;
        profilePictureUrl: string | null;
        bio: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        reputationScore: number;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        isVerified: boolean;
        isEmailVerified: boolean;
        preferredLanguage: string;
        socialLinks: import("@prisma/client/runtime/library").JsonValue;
        skills: string[];
        lastLoginAt: Date | null;
        createdAt: Date;
    } | null>;
    getProfile(userId: string): Promise<{
        stats: {
            totalReports: number;
            validReports: number;
            successRate: number;
            totalEarned: number | import("@prisma/client/runtime/library").Decimal;
        };
        id: string;
        email: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        countryCode: string;
        profilePictureUrl: string | null;
        bio: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        reputationScore: number;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        isVerified: boolean;
        isEmailVerified: boolean;
        preferredLanguage: string;
        socialLinks: import("@prisma/client/runtime/library").JsonValue;
        skills: string[];
        lastLoginAt: Date | null;
        createdAt: Date;
    } | null>;
    updateProfile(userId: string, updateData: any): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        profilePictureUrl: string | null;
        bio: string | null;
        preferredLanguage: string;
        timezone: string;
        socialLinks: import("@prisma/client/runtime/library").JsonValue;
        skills: string[];
    }>;
    updateNotificationPreferences(userId: string, preferences: any): Promise<{
        message: string;
        preferences: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updatePrivacySettings(userId: string, settings: any): Promise<{
        message: string;
        settings: any;
    }>;
    updatePreferences(userId: string, preferences: any): Promise<{
        message: string;
        preferences: any;
    }>;
    requestDataExport(userId: string): Promise<{
        message: string;
        requestedAt: Date;
    }>;
    requestDataDeletion(userId: string): Promise<{
        message: string;
        requestedAt: Date;
    }>;
    getLeaderboard(limit?: number): Promise<{}>;
}
