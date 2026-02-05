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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    async getAllUsers(role, isVerified, isBanned, search, page, limit) {
        return this.adminService.getAllUsers({
            role,
            isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
            isBanned: isBanned === 'true' ? true : isBanned === 'false' ? false : undefined,
            search,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }
    async verifyCompany(userId) {
        return this.adminService.verifyCompany(userId);
    }
    async banUser(userId, reason) {
        return this.adminService.banUser(userId, reason);
    }
    async updateUser(userId, data) {
        return this.adminService.updateUser(userId, data);
    }
    async deleteUser(userId) {
        return this.adminService.deleteUser(userId);
    }
    async getAllReports(status, severity, programId, search, page, limit) {
        return this.adminService.getAllReports({
            status,
            severity,
            programId,
            search,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }
    async getAllPayouts(status) {
        return this.adminService.getAllPayouts(status);
    }
    async processPayout(payoutId, status, transactionRef, adminNotes) {
        return this.adminService.processPayout(payoutId, status, transactionRef, adminNotes);
    }
    async getTransactions(status, userId, page, limit) {
        const filters = {
            status,
            userId,
            page: Number(page) || 1,
            limit: Number(limit) || 20
        };
        return this.adminService.getTransactionLogs(filters);
    }
    async getUserGrowth(days) {
        return this.adminService.getUserGrowthData(Number(days) || 30);
    }
    async getReportTrends(days) {
        return this.adminService.getReportTrends(Number(days) || 30);
    }
    async getRevenueTrends(days) {
        return this.adminService.getRevenueTrends(Number(days) || 30);
    }
    async getKycQueue() {
        return this.adminService.getKycQueue();
    }
    async reviewKyc(userId, status, notes) {
        return this.adminService.reviewKyc(userId, status, notes);
    }
    async bulkVerifyCompanies(userIds) {
        return this.adminService.bulkVerifyCompanies(userIds);
    }
    async bulkBanUsers(userIds, reason) {
        return this.adminService.bulkBanUsers(userIds, reason);
    }
    async bulkDeleteUsers(userIds) {
        return this.adminService.bulkDeleteUsers(userIds);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('isVerified')),
    __param(2, (0, common_1.Query)('isBanned')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyCompany", null);
__decorate([
    (0, common_1.Patch)('users/:id/ban'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "banUser", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('severity')),
    __param(2, (0, common_1.Query)('programId')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllReports", null);
__decorate([
    (0, common_1.Get)('payouts'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllPayouts", null);
__decorate([
    (0, common_1.Patch)('payouts/:id/process'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('transactionRef')),
    __param(3, (0, common_1.Body)('adminNotes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "processPayout", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('analytics/user-growth'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserGrowth", null);
__decorate([
    (0, common_1.Get)('analytics/report-trends'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReportTrends", null);
__decorate([
    (0, common_1.Get)('analytics/revenue-trends'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRevenueTrends", null);
__decorate([
    (0, common_1.Get)('kyc/queue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getKycQueue", null);
__decorate([
    (0, common_1.Patch)('kyc/:userId/review'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviewKyc", null);
__decorate([
    (0, common_1.Post)('users/bulk/verify'),
    __param(0, (0, common_1.Body)('userIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkVerifyCompanies", null);
__decorate([
    (0, common_1.Post)('users/bulk/ban'),
    __param(0, (0, common_1.Body)('userIds')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkBanUsers", null);
__decorate([
    (0, common_1.Post)('users/bulk/delete'),
    __param(0, (0, common_1.Body)('userIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkDeleteUsers", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map