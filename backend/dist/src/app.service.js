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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("./prisma/prisma.service");
let AppService = class AppService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    getHello() {
        return 'UzSecure Bug Bounty Platform API';
    }
    async getPlatformStats() {
        const cacheKey = 'platform:stats';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const [totalBountiesPaid, activePrograms, totalResearchers, vulnerabilitiesFixed,] = await Promise.all([
            this.prisma.payment.aggregate({
                where: { status: 'PAID' },
                _sum: { amount: true },
            }),
            this.prisma.program.count({
                where: { status: 'ACTIVE' },
            }),
            this.prisma.user.count({
                where: { role: 'RESEARCHER' },
            }),
            this.prisma.report.count({
                where: { status: 'RESOLVED' },
            }),
        ]);
        const stats = {
            totalBountiesPaid: totalBountiesPaid._sum.amount || 0,
            activePrograms,
            totalResearchers,
            vulnerabilitiesFixed,
        };
        await this.cacheManager.set(cacheKey, stats, 300000);
        return stats;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], AppService);
//# sourceMappingURL=app.service.js.map