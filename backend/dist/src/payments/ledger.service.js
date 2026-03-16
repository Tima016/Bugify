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
var LedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let LedgerService = LedgerService_1 = class LedgerService {
    prisma;
    logger = new common_1.Logger(LedgerService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async executeReportPayout(params) {
        const { userId, reportId, amount, currency = 'USD', description, createdBy } = params;
        if (amount <= 0) {
            throw new common_1.BadRequestException('Payout amount must be positive');
        }
        const transactionId = (0, crypto_1.randomUUID)();
        const escrowAccount = 'escrow';
        const userWalletAccount = `user_wallet:${userId}`;
        return this.prisma.$transaction(async (tx) => {
            const escrowBalance = await this.getAccountBalance(tx, escrowAccount);
            if (escrowBalance < amount) {
                throw new common_1.BadRequestException('Insufficient escrow balance');
            }
            await tx.ledgerEntry.create({
                data: {
                    transactionId,
                    accountId: escrowAccount,
                    type: client_1.LedgerType.DEBIT,
                    amount,
                    currency,
                    referenceType: 'REPORT_PAYOUT',
                    referenceId: reportId,
                    description: description || `Payout for report ${reportId}`,
                    balanceAfter: escrowBalance - amount,
                    createdBy,
                },
            });
            const walletBalance = await this.getAccountBalance(tx, userWalletAccount);
            await tx.ledgerEntry.create({
                data: {
                    transactionId,
                    accountId: userWalletAccount,
                    type: client_1.LedgerType.CREDIT,
                    amount,
                    currency,
                    referenceType: 'REPORT_PAYOUT',
                    referenceId: reportId,
                    description: description || `Bounty received for report ${reportId}`,
                    balanceAfter: walletBalance + amount,
                    createdBy,
                },
            });
            await tx.user.update({
                where: { id: userId },
                data: {
                    currentBalance: { increment: amount },
                    totalEarnings: { increment: amount },
                },
            });
            this.logger.log(`Payout executed: txn=${transactionId}, user=${userId}, report=${reportId}, amount=${amount} ${currency}`);
            return transactionId;
        });
    }
    async getAccountBalance(tx, accountId) {
        const credits = await tx.ledgerEntry.aggregate({
            where: { accountId, type: client_1.LedgerType.CREDIT },
            _sum: { amount: true },
        });
        const debits = await tx.ledgerEntry.aggregate({
            where: { accountId, type: client_1.LedgerType.DEBIT },
            _sum: { amount: true },
        });
        const creditTotal = Number(credits._sum.amount || 0);
        const debitTotal = Number(debits._sum.amount || 0);
        return creditTotal - debitTotal;
    }
    async getAccountHistory(accountId, limit = 50) {
        return this.prisma.ledgerEntry.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getTransaction(transactionId) {
        return this.prisma.ledgerEntry.findMany({
            where: { transactionId },
            orderBy: { type: 'asc' },
        });
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = LedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map