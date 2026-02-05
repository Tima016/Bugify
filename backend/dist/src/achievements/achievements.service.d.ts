import { PrismaService } from '../prisma/prisma.service';
export declare enum AchievementType {
    FIRST_BLOOD = "FIRST_BLOOD",
    CRITICAL_HUNTER = "CRITICAL_HUNTER",
    STREAK_7 = "STREAK_7",
    STREAK_30 = "STREAK_30",
    TOP_10 = "TOP_10",
    BOUNTY_HUNTER = "BOUNTY_HUNTER",
    ELITE_HUNTER = "ELITE_HUNTER",
    VERIFIED = "VERIFIED",
    SOCIAL_BUTTERFLY = "SOCIAL_BUTTERFLY",
    HELPFUL = "HELPFUL",
    FAST_RESPONDER = "FAST_RESPONDER",
    POLYGLOT = "POLYGLOT"
}
export interface AchievementDefinition {
    type: AchievementType;
    title: string;
    description: string;
    iconUrl: string;
}
export declare class AchievementsService {
    private prisma;
    constructor(prisma: PrismaService);
    private achievementDefinitions;
    awardAchievement(userId: string, type: AchievementType, metadata?: any): Promise<{
        id: string;
        description: string;
        type: string;
        title: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        iconUrl: string | null;
        earnedAt: Date;
    }>;
    checkAchievements(userId: string): Promise<string[] | undefined>;
    getUserAchievements(userId: string): Promise<{
        id: string;
        description: string;
        type: string;
        title: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        iconUrl: string | null;
        earnedAt: Date;
    }[]>;
    getAvailableAchievements(): AchievementDefinition[];
    getAchievementStats(userId: string): Promise<{
        earned: number;
        total: number;
        percentage: number;
    }>;
    private hasAchievement;
}
