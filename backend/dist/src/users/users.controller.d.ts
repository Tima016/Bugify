import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMyProfile(req: any): Promise<{
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
    getLeaderboard(): Promise<{}>;
    getUser(id: string): Promise<{
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
    updateProfile(req: any, updateData: any): Promise<{
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
    updateNotificationPreferences(req: any, preferences: any): Promise<{
        message: string;
        preferences: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updatePrivacySettings(req: any, settings: any): Promise<{
        message: string;
        settings: any;
    }>;
    updatePreferences(req: any, preferences: any): Promise<{
        message: string;
        preferences: any;
    }>;
    exportData(req: any): Promise<{
        message: string;
        requestedAt: Date;
    }>;
    requestDataDeletion(req: any): Promise<{
        message: string;
        requestedAt: Date;
    }>;
}
