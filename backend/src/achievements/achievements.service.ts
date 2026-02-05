import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum AchievementType {
    FIRST_BLOOD = 'FIRST_BLOOD', // First accepted report
    CRITICAL_HUNTER = 'CRITICAL_HUNTER', // Found 5 critical vulnerabilities
    STREAK_7 = 'STREAK_7', // 7-day submission streak
    STREAK_30 = 'STREAK_30', // 30-day submission streak
    TOP_10 = 'TOP_10', // Reached top 10 on leaderboard
    BOUNTY_HUNTER = 'BOUNTY_HUNTER', // Earned $1000+
    ELITE_HUNTER = 'ELITE_HUNTER', // Earned $10000+
    VERIFIED = 'VERIFIED', // Completed KYC verification
    SOCIAL_BUTTERFLY = 'SOCIAL_BUTTERFLY', // Connected all social accounts
    HELPFUL = 'HELPFUL', // 10+ helpful comments
    FAST_RESPONDER = 'FAST_RESPONDER', // Average response time < 24h
    POLYGLOT = 'POLYGLOT', // Submitted reports in 3+ programs
}

export interface AchievementDefinition {
    type: AchievementType;
    title: string;
    description: string;
    iconUrl: string;
}

@Injectable()
export class AchievementsService {
    constructor(private prisma: PrismaService) { }

    private achievementDefinitions: AchievementDefinition[] = [
        {
            type: AchievementType.FIRST_BLOOD,
            title: 'First Blood',
            description: 'Submitted your first accepted vulnerability report',
            iconUrl: '/achievements/first-blood.svg',
        },
        {
            type: AchievementType.CRITICAL_HUNTER,
            title: 'Critical Hunter',
            description: 'Found 5 critical vulnerabilities',
            iconUrl: '/achievements/critical-hunter.svg',
        },
        {
            type: AchievementType.STREAK_7,
            title: '7-Day Streak',
            description: 'Submitted reports for 7 consecutive days',
            iconUrl: '/achievements/streak-7.svg',
        },
        {
            type: AchievementType.STREAK_30,
            title: '30-Day Streak',
            description: 'Submitted reports for 30 consecutive days',
            iconUrl: '/achievements/streak-30.svg',
        },
        {
            type: AchievementType.TOP_10,
            title: 'Top 10',
            description: 'Reached the top 10 on the leaderboard',
            iconUrl: '/achievements/top-10.svg',
        },
        {
            type: AchievementType.BOUNTY_HUNTER,
            title: 'Bounty Hunter',
            description: 'Earned over $1,000 in bounties',
            iconUrl: '/achievements/bounty-hunter.svg',
        },
        {
            type: AchievementType.ELITE_HUNTER,
            title: 'Elite Hunter',
            description: 'Earned over $10,000 in bounties',
            iconUrl: '/achievements/elite-hunter.svg',
        },
        {
            type: AchievementType.VERIFIED,
            title: 'Verified',
            description: 'Completed KYC verification',
            iconUrl: '/achievements/verified.svg',
        },
        {
            type: AchievementType.SOCIAL_BUTTERFLY,
            title: 'Social Butterfly',
            description: 'Connected all social media accounts',
            iconUrl: '/achievements/social-butterfly.svg',
        },
        {
            type: AchievementType.HELPFUL,
            title: 'Helpful',
            description: 'Posted 10+ helpful comments',
            iconUrl: '/achievements/helpful.svg',
        },
        {
            type: AchievementType.FAST_RESPONDER,
            title: 'Fast Responder',
            description: 'Maintained average response time under 24 hours',
            iconUrl: '/achievements/fast-responder.svg',
        },
        {
            type: AchievementType.POLYGLOT,
            title: 'Polyglot',
            description: 'Submitted reports to 3+ different programs',
            iconUrl: '/achievements/polyglot.svg',
        },
    ];

    /**
     * Award an achievement to a user
     */
    async awardAchievement(userId: string, type: AchievementType, metadata?: any) {
        // Check if user already has this achievement
        const existing = await this.prisma.achievement.findFirst({
            where: { userId, type },
        });

        if (existing) {
            return existing; // Already awarded
        }

        const definition = this.achievementDefinitions.find(a => a.type === type);
        if (!definition) {
            throw new Error(`Unknown achievement type: ${type}`);
        }

        // Create achievement
        const achievement = await this.prisma.achievement.create({
            data: {
                userId,
                type,
                title: definition.title,
                description: definition.description,
                iconUrl: definition.iconUrl,
                metadata,
            },
        });

        // Create notification
        await this.prisma.notification.create({
            data: {
                userId,
                type: 'ACHIEVEMENT',
                title: '🏆 New Achievement Unlocked!',
                message: `You earned the "${definition.title}" achievement!`,
                isRead: false,
            },
        });

        return achievement;
    }

    /**
     * Check and award achievements for a user
     */
    async checkAchievements(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                reports: {
                    where: { status: { in: ['ACCEPTED', 'RESOLVED', 'CLOSED'] } },
                },
                achievements: true,
            },
        });

        if (!user) return;

        const awarded: string[] = [];

        // First Blood
        if (user.reports.length === 1 && !this.hasAchievement(user, AchievementType.FIRST_BLOOD)) {
            await this.awardAchievement(userId, AchievementType.FIRST_BLOOD);
            awarded.push('FIRST_BLOOD');
        }

        // Critical Hunter
        const criticalReports = user.reports.filter(r => r.severity === 'CRITICAL');
        if (criticalReports.length >= 5 && !this.hasAchievement(user, AchievementType.CRITICAL_HUNTER)) {
            await this.awardAchievement(userId, AchievementType.CRITICAL_HUNTER);
            awarded.push('CRITICAL_HUNTER');
        }

        // Bounty Hunter
        if (Number(user.totalEarnings) >= 1000 && !this.hasAchievement(user, AchievementType.BOUNTY_HUNTER)) {
            await this.awardAchievement(userId, AchievementType.BOUNTY_HUNTER);
            awarded.push('BOUNTY_HUNTER');
        }

        // Elite Hunter
        if (Number(user.totalEarnings) >= 10000 && !this.hasAchievement(user, AchievementType.ELITE_HUNTER)) {
            await this.awardAchievement(userId, AchievementType.ELITE_HUNTER);
            awarded.push('ELITE_HUNTER');
        }

        // Verified
        if (user.isVerified && !this.hasAchievement(user, AchievementType.VERIFIED)) {
            await this.awardAchievement(userId, AchievementType.VERIFIED);
            awarded.push('VERIFIED');
        }

        return awarded;
    }

    /**
     * Get user achievements
     */
    async getUserAchievements(userId: string) {
        return this.prisma.achievement.findMany({
            where: { userId },
            orderBy: { earnedAt: 'desc' },
        });
    }

    /**
     * Get all available achievements
     */
    getAvailableAchievements(): AchievementDefinition[] {
        return this.achievementDefinitions;
    }

    /**
     * Get achievement statistics
     */
    async getAchievementStats(userId: string) {
        const earned = await this.prisma.achievement.count({
            where: { userId },
        });

        return {
            earned,
            total: this.achievementDefinitions.length,
            percentage: Math.round((earned / this.achievementDefinitions.length) * 100),
        };
    }

    private hasAchievement(user: any, type: AchievementType): boolean {
        return user.achievements.some((a: any) => a.type === type);
    }
}
