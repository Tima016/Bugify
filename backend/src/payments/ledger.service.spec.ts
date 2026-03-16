import { LedgerService } from './ledger.service';
import { BadRequestException } from '@nestjs/common';

describe('LedgerService', () => {
    let service: LedgerService;
    let mockPrisma: any;
    let mockTx: any;

    beforeEach(() => {
        mockTx = {
            ledgerEntry: {
                create: jest.fn().mockResolvedValue({}),
                aggregate: jest.fn(),
            },
            user: {
                update: jest.fn().mockResolvedValue({}),
            },
        };

        mockPrisma = {
            $transaction: jest.fn((cb: any) => cb(mockTx)),
            ledgerEntry: {
                findMany: jest.fn().mockResolvedValue([]),
                aggregate: jest.fn(),
            },
        };

        service = new LedgerService(mockPrisma as any);
    });

    afterEach(() => jest.clearAllMocks());

    describe('executeReportPayout', () => {
        const payoutParams = {
            userId: 'user-1',
            reportId: 'report-1',
            amount: 500,
            currency: 'USD',
            description: 'Bounty for XSS',
            createdBy: 'admin-1',
        };

        it('should create exactly 2 ledger entries (DEBIT + CREDIT)', async () => {
            // Mock escrow balance sufficient
            mockTx.ledgerEntry.aggregate
                .mockResolvedValueOnce({ _sum: { amount: 1000 } })  // escrow credits
                .mockResolvedValueOnce({ _sum: { amount: 0 } })     // escrow debits
                .mockResolvedValueOnce({ _sum: { amount: 0 } })     // wallet credits
                .mockResolvedValueOnce({ _sum: { amount: 0 } });    // wallet debits

            await service.executeReportPayout(payoutParams);

            expect(mockTx.ledgerEntry.create).toHaveBeenCalledTimes(2);

            // First call: DEBIT from escrow
            expect(mockTx.ledgerEntry.create).toHaveBeenNthCalledWith(1,
                expect.objectContaining({
                    data: expect.objectContaining({
                        accountId: 'escrow',
                        type: 'DEBIT',
                        amount: 500,
                        referenceType: 'REPORT_PAYOUT',
                    }),
                }),
            );

            // Second call: CREDIT to user wallet
            expect(mockTx.ledgerEntry.create).toHaveBeenNthCalledWith(2,
                expect.objectContaining({
                    data: expect.objectContaining({
                        accountId: 'user_wallet:user-1',
                        type: 'CREDIT',
                        amount: 500,
                    }),
                }),
            );
        });

        it('should update user balance on payout', async () => {
            mockTx.ledgerEntry.aggregate
                .mockResolvedValueOnce({ _sum: { amount: 1000 } })
                .mockResolvedValueOnce({ _sum: { amount: 0 } })
                .mockResolvedValueOnce({ _sum: { amount: 0 } })
                .mockResolvedValueOnce({ _sum: { amount: 0 } });

            await service.executeReportPayout(payoutParams);

            expect(mockTx.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        currentBalance: { increment: 500 },
                        totalEarnings: { increment: 500 },
                    }),
                }),
            );
        });

        it('should reject zero or negative amounts', async () => {
            await expect(
                service.executeReportPayout({ ...payoutParams, amount: 0 }),
            ).rejects.toThrow(BadRequestException);

            await expect(
                service.executeReportPayout({ ...payoutParams, amount: -100 }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should reject when escrow balance is insufficient', async () => {
            mockTx.ledgerEntry.aggregate
                .mockResolvedValueOnce({ _sum: { amount: 100 } })   // escrow credits
                .mockResolvedValueOnce({ _sum: { amount: 0 } });    // escrow debits

            await expect(
                service.executeReportPayout({ ...payoutParams, amount: 500 }),
            ).rejects.toThrow('Insufficient escrow balance');
        });

        it('should use same transactionId for both entries', async () => {
            mockTx.ledgerEntry.aggregate
                .mockResolvedValueOnce({ _sum: { amount: 1000 } })
                .mockResolvedValueOnce({ _sum: { amount: 0 } })
                .mockResolvedValueOnce({ _sum: { amount: 0 } })
                .mockResolvedValueOnce({ _sum: { amount: 0 } });

            await service.executeReportPayout(payoutParams);

            const call1 = mockTx.ledgerEntry.create.mock.calls[0][0].data.transactionId;
            const call2 = mockTx.ledgerEntry.create.mock.calls[1][0].data.transactionId;
            expect(call1).toBe(call2);
            expect(call1).toMatch(/^[0-9a-f-]{36}$/); // UUID format
        });
    });

    describe('getAccountHistory', () => {
        it('should return ledger entries ordered by date descending', async () => {
            await service.getAccountHistory('escrow', 10);
            expect(mockPrisma.ledgerEntry.findMany).toHaveBeenCalledWith({
                where: { accountId: 'escrow' },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
        });
    });

    describe('getTransaction', () => {
        it('should return both entries of a transaction pair', async () => {
            await service.getTransaction('txn-id');
            expect(mockPrisma.ledgerEntry.findMany).toHaveBeenCalledWith({
                where: { transactionId: 'txn-id' },
                orderBy: { type: 'asc' },
            });
        });
    });
});
