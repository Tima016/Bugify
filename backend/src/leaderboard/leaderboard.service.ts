import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
    constructor(private prisma: PrismaService) { }

    /**
     * Update leaderboard entries for a specific period
     */
    async updateLeaderboard(period: string = 'all-time') {
        // Get all researchers with their stats
        const researchers = await this.prisma.user.findMany({
            where: { role: 'RESEARCHER' },
            select: {
                id: true,
                reputationScore: true,
                totalEarnings: true,
                _count: {
                    select: {
                        reports: {
                            where: {
                                status: { in: ['ACCEPTED', 'RESOLVED', 'CLOSED'] },
                            },
                        },
                    },
                },
            },
            orderBy: { reputationScore: 'desc' },
        });

        // Delete existing entries for this period
        await this.prisma.leaderboardEntry.deleteMany({
            where: { period },
        });

        // Create new entries
        const entries = researchers.map((researcher, index) => ({
            userId: researcher.id,
            rank: index + 1,
            reputationScore: researcher.reputationScore,
            totalEarnings: researcher.totalEarnings,
            validReports: researcher._count.reports,
            period,
        }));

        // Bulk insert
        await this.prisma.leaderboardEntry.createMany({
            data: entries,
        });

        return entries;
    }

    /**
     * Get leaderboard for a specific period
     */
    async getLeaderboard(period: string = 'all-time', limit: number = 100) {
        return this.prisma.leaderboardEntry.findMany({
            where: { period },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePictureUrl: true,
                    },
                },
            },
            orderBy: { rank: 'asc' },
            take: limit,
        });
    }

    /**
     * Get user's rank for a specific period
     */
    async getUserRank(userId: string, period: string = 'all-time') {
        return this.prisma.leaderboardEntry.findUnique({
            where: {
                userId_period: {
                    userId,
                    period,
                },
            },
        });
    }

    /**
     * Update all leaderboard periods (monthly, quarterly, all-time)
     */
    async updateAllPeriods() {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentQuarter = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;

        await Promise.all([
            this.updateLeaderboard('all-time'),
            this.updateLeaderboard(currentMonth),
            this.updateLeaderboard(currentQuarter),
        ]);
    }
}
