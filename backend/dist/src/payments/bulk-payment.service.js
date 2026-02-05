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
exports.BulkPaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uz_payment_service_1 = require("./uz-payment.service");
let BulkPaymentService = class BulkPaymentService {
    prisma;
    uzPayment;
    constructor(prisma, uzPayment) {
        this.prisma = prisma;
        this.uzPayment = uzPayment;
    }
    async processBulkPayments(request) {
        const results = [];
        for (const payment of request.payments) {
            try {
                const paymentRecord = await this.prisma.payment.create({
                    data: {
                        researcherId: payment.userId,
                        reportId: payment.reportId || '',
                        companyId: '',
                        amount: payment.amount,
                        currency: 'UZS',
                        status: 'PENDING',
                        paymentMethod: 'BANK_TRANSFER',
                    },
                });
                await new Promise(resolve => setTimeout(resolve, 100));
                await this.prisma.payment.update({
                    where: { id: paymentRecord.id },
                    data: { status: 'COMPLETED', paidAt: new Date() },
                });
                results.push({
                    userId: payment.userId,
                    status: 'success',
                    paymentId: paymentRecord.id,
                });
            }
            catch (error) {
                results.push({
                    userId: payment.userId,
                    status: 'failed',
                    error: error.message,
                });
            }
        }
        return {
            total: request.payments.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length,
            results,
        };
    }
    async generatePaymentReport(startDate, endDate) {
        const payments = await this.prisma.payment.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED',
            },
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
        const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            period: { start: startDate, end: endDate },
            totalPayments: payments.length,
            totalAmount,
            payments,
        };
    }
};
exports.BulkPaymentService = BulkPaymentService;
exports.BulkPaymentService = BulkPaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        uz_payment_service_1.UzPaymentService])
], BulkPaymentService);
//# sourceMappingURL=bulk-payment.service.js.map