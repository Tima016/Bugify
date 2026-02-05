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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPayoutRequest(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            if (user.currentBalance.toNumber() < dto.amount) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            const payoutRequest = await tx.payoutRequest.create({
                data: {
                    researcherId: userId,
                    amount: dto.amount,
                    currency: dto.currency,
                    method: dto.method,
                    destination: dto.destination,
                    status: 'PENDING',
                },
            });
            await tx.user.update({
                where: { id: userId },
                data: {
                    currentBalance: {
                        decrement: dto.amount,
                    },
                },
            });
            return payoutRequest;
        });
    }
    async getMyPayouts(userId) {
        return this.prisma.payoutRequest.findMany({
            where: { researcherId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getBalance(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { currentBalance: true, totalEarnings: true },
        });
        return user;
    }
    async findAllPayoutRequests() {
        return this.prisma.payoutRequest.findMany({
            where: { status: 'PENDING' },
            include: { researcher: { select: { username: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updatePayoutStatus(id, status) {
        return this.prisma.payoutRequest.update({
            where: { id },
            data: { status },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map