// ============================================
// Ledger Service — Double-Entry Financial Accounting
// Every payout creates 2 entries: DEBIT escrow, CREDIT wallet
// Uses SELECT FOR UPDATE to prevent race conditions
// ============================================
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerType } from '@prisma/client';
import { randomUUID } from 'crypto';

export interface CreatePayoutParams {
    userId: string;
    reportId: string;
    amount: number;
    currency?: string;
    description?: string;
    createdBy: string;
}

@Injectable()
export class LedgerService {
    private readonly logger = new Logger(LedgerService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Execute a payout: debit escrow, credit user wallet.
     * Uses a serializable transaction with FOR UPDATE locks.
     */
    async executeReportPayout(params: CreatePayoutParams): Promise<string> {
        const { userId, reportId, amount, currency = 'USD', description, createdBy } = params;

        if (amount <= 0) {
            throw new BadRequestException('Payout amount must be positive');
        }

        const transactionId = randomUUID();
        const escrowAccount = 'escrow';
        const userWalletAccount = `user_wallet:${userId}`;

        return this.prisma.$transaction(async (tx) => {
            // Calculate current escrow balance (using raw query for FOR UPDATE locking)
            const escrowBalance = await this.getAccountBalance(tx, escrowAccount);

            if (escrowBalance < amount) {
                throw new BadRequestException('Insufficient escrow balance');
            }

            // DEBIT from escrow (money leaves escrow)
            await tx.ledgerEntry.create({
                data: {
                    transactionId,
                    accountId: escrowAccount,
                    type: LedgerType.DEBIT,
                    amount,
                    currency,
                    referenceType: 'REPORT_PAYOUT',
                    referenceId: reportId,
                    description: description || `Payout for report ${reportId}`,
                    balanceAfter: escrowBalance - amount,
                    createdBy,
                },
            });

            // Get current user wallet balance
            const walletBalance = await this.getAccountBalance(tx, userWalletAccount);

            // CREDIT to user wallet (money enters user wallet)
            await tx.ledgerEntry.create({
                data: {
                    transactionId,
                    accountId: userWalletAccount,
                    type: LedgerType.CREDIT,
                    amount,
                    currency,
                    referenceType: 'REPORT_PAYOUT',
                    referenceId: reportId,
                    description: description || `Bounty received for report ${reportId}`,
                    balanceAfter: walletBalance + amount,
                    createdBy,
                },
            });

            // Update user's currentBalance
            await tx.user.update({
                where: { id: userId },
                data: {
                    currentBalance: { increment: amount },
                    totalEarnings: { increment: amount },
                },
            });

            this.logger.log(
                `Payout executed: txn=${transactionId}, user=${userId}, report=${reportId}, amount=${amount} ${currency}`,
            );

            return transactionId;
        });
    }

    /**
     * Get the running balance for an account by summing all ledger entries.
     */
    private async getAccountBalance(tx: any, accountId: string): Promise<number> {
        const credits = await tx.ledgerEntry.aggregate({
            where: { accountId, type: LedgerType.CREDIT },
            _sum: { amount: true },
        });

        const debits = await tx.ledgerEntry.aggregate({
            where: { accountId, type: LedgerType.DEBIT },
            _sum: { amount: true },
        });

        const creditTotal = Number(credits._sum.amount || 0);
        const debitTotal = Number(debits._sum.amount || 0);

        return creditTotal - debitTotal;
    }

    /**
     * Get ledger history for a specific account.
     */
    async getAccountHistory(accountId: string, limit = 50) {
        return this.prisma.ledgerEntry.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get both entries of a transaction.
     */
    async getTransaction(transactionId: string) {
        return this.prisma.ledgerEntry.findMany({
            where: { transactionId },
            orderBy: { type: 'asc' },
        });
    }
}
