"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementsService = exports.AchievementType = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var AchievementType;
(function (AchievementType) {
    AchievementType["FIRST_BLOOD"] = "FIRST_BLOOD";
    AchievementType["CRITICAL_HUNTER"] = "CRITICAL_HUNTER";
    AchievementType["STREAK_7"] = "STREAK_7";
    AchievementType["STREAK_30"] = "STREAK_30";
    AchievementType["TOP_10"] = "TOP_10";
    AchievementType["BOUNTY_HUNTER"] = "BOUNTY_HUNTER";
    AchievementType["ELITE_HUNTER"] = "ELITE_HUNTER";
    AchievementType["VERIFIED"] = "VERIFIED";
    AchievementType["SOCIAL_BUTTERFLY"] = "SOCIAL_BUTTERFLY";
    AchievementType["HELPFUL"] = "HELPFUL";
    AchievementType["FAST_RESPONDER"] = "FAST_RESPONDER";
    AchievementType["POLYGLOT"] = "POLYGLOT";
})(AchievementType || (exports.AchievementType = AchievementType = {}));
let AchievementsService = class AchievementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    achievementDefinitions = [
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
    async awardAchievement(userId, type, metadata) {
        const existing = await this.prisma.achievement.findFirst({
            where: { userId, type },
        });
        if (existing) {
            return existing;
        }
        const definition = this.achievementDefinitions.find(a => a.type === type);
        if (!definition) {
            throw new Error(`Unknown achievement type: ${type}`);
        }
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
    async checkAchievements(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                reports: {
                    where: { status: { in: ['ACCEPTED', 'RESOLVED', 'CLOSED'] } },
                },
                achievements: true,
            },
        });
        if (!user)
            return;
        const awarded = [];
        if (user.reports.length === 1 && !this.hasAchievement(user, AchievementType.FIRST_BLOOD)) {
            await this.awardAchievement(userId, AchievementType.FIRST_BLOOD);
            awarded.push('FIRST_BLOOD');
        }
        const criticalReports = user.reports.filter(r => r.severity === 'CRITICAL');
        if (criticalReports.length >= 5 && !this.hasAchievement(user, AchievementType.CRITICAL_HUNTER)) {
            await this.awardAchievement(userId, AchievementType.CRITICAL_HUNTER);
            awarded.push('CRITICAL_HUNTER');
        }
        if (Number(user.totalEarnings) >= 1000 && !this.hasAchievement(user, AchievementType.BOUNTY_HUNTER)) {
            await this.awardAchievement(userId, AchievementType.BOUNTY_HUNTER);
            awarded.push('BOUNTY_HUNTER');
        }
        if (Number(user.totalEarnings) >= 10000 && !this.hasAchievement(user, AchievementType.ELITE_HUNTER)) {
            await this.awardAchievement(userId, AchievementType.ELITE_HUNTER);
            awarded.push('ELITE_HUNTER');
        }
        if (user.isVerified && !this.hasAchievement(user, AchievementType.VERIFIED)) {
            await this.awardAchievement(userId, AchievementType.VERIFIED);
            awarded.push('VERIFIED');
        }
        return awarded;
    }
    async getUserAchievements(userId) {
        return this.prisma.achievement.findMany({
            where: { userId },
            orderBy: { earnedAt: 'desc' },
        });
    }
    getAvailableAchievements() {
        return this.achievementDefinitions;
    }
    async getAchievementStats(userId) {
        const earned = await this.prisma.achievement.count({
            where: { userId },
        });
        return {
            earned,
            total: this.achievementDefinitions.length,
            percentage: Math.round((earned / this.achievementDefinitions.length) * 100),
        };
    }
    hasAchievement(user, type) {
        return user.achievements.some((a) => a.type === type);
    }
};
exports.AchievementsService = AchievementsService;
exports.AchievementsService = AchievementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AchievementsService);
//# sourceMappingURL=achievements.service.js.map