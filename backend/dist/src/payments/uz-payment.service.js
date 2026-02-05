"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UzPaymentService = exports.PaymentStatus = exports.PaymentProvider = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["UZCARD"] = "UZCARD";
    PaymentProvider["HUMO"] = "HUMO";
    PaymentProvider["CLICK"] = "CLICK";
    PaymentProvider["PAYME"] = "PAYME";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let UzPaymentService = class UzPaymentService {
    prisma;
    config;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async initiateUzCardPayment(request) {
        const merchantId = this.config.get('UZCARD_MERCHANT_ID');
        const secretKey = this.config.get('UZCARD_SECRET_KEY');
        const payment = await this.prisma.payment.create({
            data: {
                researcherId: request.userId,
                reportId: '',
                companyId: '',
                amount: request.amount,
                currency: request.currency || 'UZS',
                status: 'PENDING',
                paymentMethod: 'UZCARD',
            },
        });
        const signature = this.generateUzCardSignature({
            merchantId,
            amount: request.amount,
            orderId: payment.id,
            secretKey,
        });
        const uzCardRequest = {
            merchant_id: merchantId,
            amount: request.amount * 100,
            order_id: payment.id,
            description: request.description,
            return_url: `${this.config.get('FRONTEND_URL')}/payment/callback`,
            signature,
        };
        try {
            const response = await this.callUzCardAPI(uzCardRequest);
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    transactionId: response.transaction_id,
                    status: 'PROCESSING',
                },
            });
            return {
                transactionId: response.transaction_id,
                status: PaymentStatus.PROCESSING,
                redirectUrl: response.redirect_url,
            };
        }
        catch (error) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' },
            });
            throw new common_1.BadRequestException('UzCard payment initialization failed');
        }
    }
    async initiateHumoPayment(request) {
        const merchantId = this.config.get('HUMO_MERCHANT_ID');
        const secretKey = this.config.get('HUMO_SECRET_KEY');
        const payment = await this.prisma.payment.create({
            data: {
                researcherId: request.userId,
                reportId: '',
                companyId: '',
                amount: request.amount,
                currency: request.currency || 'UZS',
                status: 'PENDING',
                paymentMethod: 'HUMO',
            },
        });
        const signature = this.generateHumoSignature({
            merchantId,
            amount: request.amount,
            orderId: payment.id,
            secretKey,
        });
        const humoRequest = {
            merchant_id: merchantId,
            amount: request.amount * 100,
            order_id: payment.id,
            description: request.description,
            return_url: `${this.config.get('FRONTEND_URL')}/payment/callback`,
            signature,
        };
        try {
            const response = await this.callHumoAPI(humoRequest);
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    transactionId: response.transaction_id,
                    status: 'PROCESSING',
                },
            });
            return {
                transactionId: response.transaction_id,
                status: PaymentStatus.PROCESSING,
                redirectUrl: response.redirect_url,
            };
        }
        catch (error) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' },
            });
            throw new common_1.BadRequestException('Humo payment initialization failed');
        }
    }
    async handlePaymentCallback(provider, data) {
        const payment = await this.prisma.payment.findFirst({
            where: { transactionId: data.transaction_id },
        });
        if (!payment) {
            throw new common_1.BadRequestException('Payment not found');
        }
        const isValid = this.verifyCallbackSignature(provider, data);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid signature');
        }
        const status = data.status === 'success' ? 'COMPLETED' : 'FAILED';
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status,
                paidAt: status === 'COMPLETED' ? new Date() : null,
            },
        });
        if (payment.reportId) {
            await this.prisma.report.update({
                where: { id: payment.reportId },
                data: {
                    paymentStatus: status === 'COMPLETED' ? 'PAID' : 'PENDING',
                },
            });
        }
        return { success: true, status };
    }
    generateUzCardSignature(params) {
        const data = `${params.merchantId}${params.amount}${params.orderId}${params.secretKey}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    generateHumoSignature(params) {
        const data = `${params.merchantId}${params.amount}${params.orderId}${params.secretKey}`;
        return crypto.createHash('md5').update(data).digest('hex');
    }
    verifyCallbackSignature(provider, data) {
        const secretKey = provider === PaymentProvider.UZCARD
            ? this.config.get('UZCARD_SECRET_KEY')
            : this.config.get('HUMO_SECRET_KEY');
        const expectedSignature = provider === PaymentProvider.UZCARD
            ? this.generateUzCardSignature({
                merchantId: data.merchant_id,
                amount: data.amount,
                orderId: data.order_id,
                secretKey,
            })
            : this.generateHumoSignature({
                merchantId: data.merchant_id,
                amount: data.amount,
                orderId: data.order_id,
                secretKey,
            });
        return expectedSignature === data.signature;
    }
    async callUzCardAPI(request) {
        return {
            transaction_id: `UZCARD_${Date.now()}`,
            redirect_url: `https://uzcard.uz/payment/${request.order_id}`,
            status: 'pending',
        };
    }
    async callHumoAPI(request) {
        return {
            transaction_id: `HUMO_${Date.now()}`,
            redirect_url: `https://humocard.uz/payment/${request.order_id}`,
            status: 'pending',
        };
    }
    async getPaymentStatus(transactionId) {
        return this.prisma.payment.findFirst({
            where: { transactionId },
            include: {
                researcher: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }
    async refundPayment(transactionId, reason) {
        const payment = await this.prisma.payment.findFirst({
            where: { transactionId },
        });
        if (!payment) {
            throw new common_1.BadRequestException('Payment not found');
        }
        if (payment.status !== 'COMPLETED') {
            throw new common_1.BadRequestException('Only completed payments can be refunded');
        }
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'CANCELLED',
                notes: `Refund: ${reason}`,
            },
        });
        return { success: true, message: 'Payment refunded successfully' };
    }
};
exports.UzPaymentService = UzPaymentService;
exports.UzPaymentService = UzPaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UzPaymentService);
//# sourceMappingURL=uz-payment.service.js.map