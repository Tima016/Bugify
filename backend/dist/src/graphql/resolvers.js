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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsResolver = exports.UserResolver = exports.ReportResolver = exports.ProgramResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const types_1 = require("./types");
const prisma_service_1 = require("../prisma/prisma.service");
const app_service_1 = require("../app.service");
const users_service_1 = require("../users/users.service");
let ProgramResolver = class ProgramResolver {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async programs(status, limit) {
        return this.prisma.program.findMany({
            where: status ? { status: status } : undefined,
            take: limit || 20,
            orderBy: { createdAt: 'desc' },
        });
    }
    async program(id) {
        return this.prisma.program.findUnique({
            where: { id },
        });
    }
};
exports.ProgramResolver = ProgramResolver;
__decorate([
    (0, graphql_1.Query)(() => [types_1.Program]),
    __param(0, (0, graphql_1.Args)('status', { nullable: true })),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProgramResolver.prototype, "programs", null);
__decorate([
    (0, graphql_1.Query)(() => types_1.Program, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgramResolver.prototype, "program", null);
exports.ProgramResolver = ProgramResolver = __decorate([
    (0, graphql_1.Resolver)(() => types_1.Program),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgramResolver);
let ReportResolver = class ReportResolver {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async reports(programId, status, limit) {
        return this.prisma.report.findMany({
            where: {
                ...(programId && { programId }),
                ...(status && { status: status }),
            },
            take: limit || 20,
            orderBy: { createdAt: 'desc' },
        });
    }
    async report(id) {
        return this.prisma.report.findUnique({
            where: { id },
        });
    }
};
exports.ReportResolver = ReportResolver;
__decorate([
    (0, graphql_1.Query)(() => [types_1.Report]),
    __param(0, (0, graphql_1.Args)('programId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], ReportResolver.prototype, "reports", null);
__decorate([
    (0, graphql_1.Query)(() => types_1.Report, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportResolver.prototype, "report", null);
exports.ReportResolver = ReportResolver = __decorate([
    (0, graphql_1.Resolver)(() => types_1.Report),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportResolver);
let UserResolver = class UserResolver {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async user(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                reputationScore: true,
                totalEarnings: true,
                isVerified: true,
                createdAt: true,
            },
        });
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, graphql_1.Query)(() => types_1.User, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
exports.UserResolver = UserResolver = __decorate([
    (0, graphql_1.Resolver)(() => types_1.User),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserResolver);
let StatsResolver = class StatsResolver {
    appService;
    usersService;
    constructor(appService, usersService) {
        this.appService = appService;
        this.usersService = usersService;
    }
    async platformStats() {
        return this.appService.getPlatformStats();
    }
    async leaderboard(limit) {
        return this.usersService.getLeaderboard(limit || 10);
    }
};
exports.StatsResolver = StatsResolver;
__decorate([
    (0, graphql_1.Query)(() => types_1.PlatformStats),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsResolver.prototype, "platformStats", null);
__decorate([
    (0, graphql_1.Query)(() => [types_1.LeaderboardEntry]),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StatsResolver.prototype, "leaderboard", null);
exports.StatsResolver = StatsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        users_service_1.UsersService])
], StatsResolver);
//# sourceMappingURL=resolvers.js.map