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
exports.LeaderboardController = void 0;
const common_1 = require("@nestjs/common");
const leaderboard_service_1 = require("./leaderboard.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let LeaderboardController = class LeaderboardController {
    leaderboardService;
    constructor(leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
    getLeaderboard(period, limit) {
        return this.leaderboardService.getLeaderboard(period || 'all-time', limit ? parseInt(limit) : 100);
    }
    getUserRank(userId, period) {
        return this.leaderboardService.getUserRank(userId, period || 'all-time');
    }
    updateLeaderboard(period) {
        return this.leaderboardService.updateLeaderboard(period || 'all-time');
    }
    updateAllPeriods() {
        return this.leaderboardService.updateAllPeriods();
    }
};
exports.LeaderboardController = LeaderboardController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get leaderboard' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LeaderboardController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user rank' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LeaderboardController.prototype, "getUserRank", null);
__decorate([
    (0, common_1.Post)('update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update leaderboard (admin only)' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaderboardController.prototype, "updateLeaderboard", null);
__decorate([
    (0, common_1.Post)('update-all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update all leaderboard periods (admin only)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaderboardController.prototype, "updateAllPeriods", null);
exports.LeaderboardController = LeaderboardController = __decorate([
    (0, swagger_1.ApiTags)('leaderboard'),
    (0, common_1.Controller)('leaderboard'),
    __metadata("design:paramtypes", [leaderboard_service_1.LeaderboardService])
], LeaderboardController);
//# sourceMappingURL=leaderboard.controller.js.map