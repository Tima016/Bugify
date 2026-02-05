import { PrismaService } from '../prisma/prisma.service';
export declare class LeaderboardService {
    private prisma;
    constructor(prisma: PrismaService);
    updateLeaderboard(period?: string): Promise<{
        userId: string;
        rank: number;
        reputationScore: number;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        validReports: number;
        period: string;
    }[]>;
    getLeaderboard(period?: string, limit?: number): Promise<({
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
        userId: string;
        rank: number;
        validReports: number;
        period: string;
        calculatedAt: Date;
    })[]>;
    getUserRank(userId: string, period?: string): Promise<{
        id: string;
        reputationScore: number;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        rank: number;
        validReports: number;
        period: string;
        calculatedAt: Date;
    } | null>;
    updateAllPeriods(): Promise<void>;
}
