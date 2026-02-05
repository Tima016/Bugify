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
exports.UzPaymentController = void 0;
const common_1 = require("@nestjs/common");
const uz_payment_service_1 = require("./uz-payment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let UzPaymentController = class UzPaymentController {
    uzPaymentService;
    constructor(uzPaymentService) {
        this.uzPaymentService = uzPaymentService;
    }
    async initiateUzCard(body) {
        return this.uzPaymentService.initiateUzCardPayment({
            ...body,
            provider: uz_payment_service_1.PaymentProvider.UZCARD,
        });
    }
    async initiateHumo(body) {
        return this.uzPaymentService.initiateHumoPayment({
            ...body,
            provider: uz_payment_service_1.PaymentProvider.HUMO,
        });
    }
    async handleCallback(provider, body) {
        const providerEnum = provider.toUpperCase();
        return this.uzPaymentService.handlePaymentCallback(providerEnum, body);
    }
    async getStatus(transactionId) {
        return this.uzPaymentService.getPaymentStatus(transactionId);
    }
    async refund(transactionId, body) {
        return this.uzPaymentService.refundPayment(transactionId, body.reason);
    }
};
exports.UzPaymentController = UzPaymentController;
__decorate([
    (0, common_1.Post)('uzcard/initiate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate UzCard payment' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UzPaymentController.prototype, "initiateUzCard", null);
__decorate([
    (0, common_1.Post)('humo/initiate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Humo payment' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UzPaymentController.prototype, "initiateHumo", null);
__decorate([
    (0, common_1.Post)('callback/:provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle payment callback' }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UzPaymentController.prototype, "handleCallback", null);
__decorate([
    (0, common_1.Get)('status/:transactionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment status' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UzPaymentController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('refund/:transactionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Refund payment' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UzPaymentController.prototype, "refund", null);
exports.UzPaymentController = UzPaymentController = __decorate([
    (0, swagger_1.ApiTags)('uz-payments'),
    (0, common_1.Controller)('uz-payments'),
    __metadata("design:paramtypes", [uz_payment_service_1.UzPaymentService])
], UzPaymentController);
//# sourceMappingURL=uz-payment.controller.js.map