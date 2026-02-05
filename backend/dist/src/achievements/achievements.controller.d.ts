import { AchievementsService } from './achievements.service';
export declare class AchievementsController {
    private achievementsService;
    constructor(achievementsService: AchievementsService);
    getAvailableAchievements(): import("./achievements.service").AchievementDefinition[];
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
    getAchievementStats(userId: string): Promise<{
        earned: number;
        total: number;
        percentage: number;
    }>;
    checkAchievements(userId: string): Promise<string[] | undefined>;
}
