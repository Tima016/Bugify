import { LeaderboardService } from './leaderboard.service';
export declare class LeaderboardController {
    private leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getLeaderboard(period?: string, limit?: string): Promise<({
        user: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
            profilePictureUrl: string | null;
        };
    } & {
        id: string;
        reputationScore: number;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        rank: number;
        userId: string;
        validReports: number;
        period: string;
        calculatedAt: Date;
    })[]>;
    getUserRank(userId: string, period?: string): Promise<{
        id: string;
        reputationScore: number;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        rank: number;
        userId: string;
        validReports: number;
        period: string;
        calculatedAt: Date;
    } | null>;
    updateLeaderboard(period?: string): Promise<{
        userId: string;
        rank: number;
        reputationScore: number;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        validReports: number;
        period: string;
    }[]>;
    updateAllPeriods(): Promise<void>;
}
