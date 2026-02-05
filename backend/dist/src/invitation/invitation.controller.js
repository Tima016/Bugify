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
exports.InvitationController = void 0;
const common_1 = require("@nestjs/common");
const invitation_service_1 = require("./invitation.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let InvitationController = class InvitationController {
    invitationService;
    constructor(invitationService) {
        this.invitationService = invitationService;
    }
    async createInvitation(req, body) {
        return this.invitationService.createInvitation(req.user.companyId, req.user.id, body);
    }
    async validateCode(body) {
        return this.invitationService.validateAndUseCode(body.code, body.email);
    }
    async getCompanyInvitations(companyId) {
        return this.invitationService.getCompanyInvitations(companyId);
    }
    async getStats(companyId) {
        return this.invitationService.getInvitationStats(companyId);
    }
    async deactivateInvitation(code, req) {
        return this.invitationService.deactivateInvitation(code, req.user.companyId);
    }
};
exports.InvitationController = InvitationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create invitation code' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate invitation code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "validateCode", null);
__decorate([
    (0, common_1.Get)('company/:companyId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get company invitations' }),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "getCompanyInvitations", null);
__decorate([
    (0, common_1.Get)('company/:companyId/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get invitation statistics' }),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':code/deactivate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate invitation code' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "deactivateInvitation", null);
exports.InvitationController = InvitationController = __decorate([
    (0, swagger_1.ApiTags)('invitations'),
    (0, common_1.Controller)('invitations'),
    __metadata("design:paramtypes", [invitation_service_1.InvitationService])
], InvitationController);
//# sourceMappingURL=invitation.controller.js.map