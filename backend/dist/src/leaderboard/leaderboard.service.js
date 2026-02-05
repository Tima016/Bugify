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
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeaderboardService = class LeaderboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateLeaderboard(period = 'all-time') {
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
        await this.prisma.leaderboardEntry.deleteMany({
            where: { period },
        });
        const entries = researchers.map((researcher, index) => ({
            userId: researcher.id,
            rank: index + 1,
            reputationScore: researcher.reputationScore,
            totalEarnings: researcher.totalEarnings,
            validReports: researcher._count.reports,
            period,
        }));
        await this.prisma.leaderboardEntry.createMany({
            data: entries,
        });
        return entries;
    }
    async getLeaderboard(period = 'all-time', limit = 100) {
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
    async getUserRank(userId, period = 'all-time') {
        return this.prisma.leaderboardEntry.findUnique({
            where: {
                userId_period: {
                    userId,
                    period,
                },
            },
        });
    }
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
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map