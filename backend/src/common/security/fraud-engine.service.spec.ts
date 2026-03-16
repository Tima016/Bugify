import { FraudEngine } from './fraud-engine.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertService } from './alert.service';

describe('FraudEngine', () => {
    let engine: FraudEngine;
    let mockPrisma: any;
    let mockAlertService: any;
    let mockCache: any;

    beforeEach(() => {
        mockPrisma = {
            report: { groupBy: jest.fn() },
            ledgerEntry: { aggregate: jest.fn() },
            payoutRequest: { findMany: jest.fn() },
            reportStatusTransition: { findMany: jest.fn() },
        };

        mockAlertService = {
            fire: jest.fn().mockResolvedValue('alert-id-1'),
        };

        mockCache = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
        };

        engine = new FraudEngine(
            mockPrisma as any,
            mockAlertService as any,
            mockCache,
        );
    });

    afterEach(() => jest.clearAllMocks());

    // ---- Signal 1: IP Clustering ----
    describe('checkIpClustering', () => {
        it('should NOT alert when fewer than 3 accounts on same subnet', async () => {
            mockCache.get.mockResolvedValue(JSON.stringify(['user-1']));
            await engine.checkIpClustering('user-2', '192.168.1.100');
            expect(mockAlertService.fire).not.toHaveBeenCalled();
        });

        it('should alert with MEDIUM when 3+ accounts on same /24 subnet', async () => {
            mockCache.get.mockResolvedValue(JSON.stringify(['user-1', 'user-2']));
            await engine.checkIpClustering('user-3', '10.0.0.42');
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'MULTI_ACCOUNT',
                    severity: 'MEDIUM',
                    cooldownKey: 'ip_cluster:10.0.0',
                }),
            );
        });

        it('should alert with HIGH when 5+ accounts on same subnet', async () => {
            mockCache.get.mockResolvedValue(JSON.stringify(['u1', 'u2', 'u3', 'u4']));
            await engine.checkIpClustering('u5', '172.16.0.1');
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'HIGH' }),
            );
        });
    });

    // ---- Signal 2: Submission Velocity ----
    describe('checkSubmissionVelocity', () => {
        it('should return false when under velocity limit', async () => {
            mockCache.get.mockResolvedValue('5');
            const flagged = await engine.checkSubmissionVelocity('user-1');
            expect(flagged).toBe(false);
            expect(mockAlertService.fire).not.toHaveBeenCalled();
        });

        it('should flag and fire alert when exceeding 10 reports/24h', async () => {
            mockCache.get.mockResolvedValue('10');
            const flagged = await engine.checkSubmissionVelocity('user-1');
            expect(flagged).toBe(true);
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'FAKE_FARMING',
                    severity: 'MEDIUM',
                }),
            );
        });
    });

    // ---- Signal 3: PoC Reuse ----
    describe('checkPocReuse', () => {
        it('should skip short PoC content', async () => {
            const flagged = await engine.checkPocReuse('user-1', 'short');
            expect(flagged).toBe(false);
            expect(mockAlertService.fire).not.toHaveBeenCalled();
        });

        it('should flag when same PoC hash is reused 3+ times', async () => {
            const longPoc = 'A'.repeat(500);
            mockCache.get.mockResolvedValue('2'); // Will become 3
            const flagged = await engine.checkPocReuse('user-1', longPoc);
            expect(flagged).toBe(true);
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({ category: 'FAKE_FARMING' }),
            );
        });
    });

    // ---- Signal 4: Severity Distribution ----
    describe('checkSeverityDistribution', () => {
        it('should skip if fewer than 15 reports', async () => {
            mockPrisma.report.groupBy.mockResolvedValue([
                { severity: 'LOW', _count: 5 },
            ]);
            await engine.checkSeverityDistribution('user-1');
            expect(mockAlertService.fire).not.toHaveBeenCalled();
        });

        it('should alert when 80%+ of reports are LOW/INFORMATIONAL', async () => {
            mockPrisma.report.groupBy.mockResolvedValue([
                { severity: 'LOW', _count: 14 },
                { severity: 'INFORMATIONAL', _count: 2 },
                { severity: 'HIGH', _count: 1 },
            ]);
            await engine.checkSeverityDistribution('user-1');
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({ category: 'FAKE_FARMING' }),
            );
        });
    });

    // ---- Signal 5: Payout Velocity ----
    describe('checkPayoutVelocity', () => {
        it('should return false when under daily payout limit', async () => {
            mockPrisma.ledgerEntry.aggregate.mockResolvedValue({
                _sum: { amount: 1000 },
            });
            const blocked = await engine.checkPayoutVelocity('user-1', 500);
            expect(blocked).toBe(false);
        });

        it('should block and alert when exceeding $5000/day', async () => {
            mockPrisma.ledgerEntry.aggregate.mockResolvedValue({
                _sum: { amount: 4800 },
            });
            const blocked = await engine.checkPayoutVelocity('user-1', 300);
            expect(blocked).toBe(true);
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'PAYMENT_FRAUD',
                    severity: 'HIGH',
                }),
            );
        });
    });

    // ---- Signal 6: Admin Bulk Changes ----
    describe('checkAdminBulkChanges', () => {
        it('should NOT alert under 20 status changes/hour', async () => {
            mockCache.get.mockResolvedValue('15');
            await engine.checkAdminBulkChanges('admin-1');
            expect(mockAlertService.fire).not.toHaveBeenCalled();
        });

        it('should alert with INSIDER_THREAT when exceeding 20 changes/hour', async () => {
            mockCache.get.mockResolvedValue('20');
            await engine.checkAdminBulkChanges('admin-1');
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'INSIDER_THREAT',
                    severity: 'HIGH',
                }),
            );
        });
    });

    // ---- Signal 7: Wallet Clustering ----
    describe('checkWalletClustering', () => {
        it('should return false when no other user shares the wallet', async () => {
            mockPrisma.payoutRequest.findMany.mockResolvedValue([]);
            const blocked = await engine.checkWalletClustering('user-1', '0xABC123');
            expect(blocked).toBe(false);
        });

        it('should flag with CRITICAL when another user shares the same wallet', async () => {
            mockPrisma.payoutRequest.findMany.mockResolvedValue([
                { researcherId: 'user-2', destination: { walletAddress: '0xABC123' } },
            ]);
            const blocked = await engine.checkWalletClustering('user-1', '0xABC123');
            expect(blocked).toBe(true);
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'MULTI_ACCOUNT',
                    severity: 'CRITICAL',
                }),
            );
        });

        it('should skip when wallet address is empty', async () => {
            const blocked = await engine.checkWalletClustering('user-1', '');
            expect(blocked).toBe(false);
        });
    });

    // ---- Signal 8: Self-Approval ----
    describe('checkSelfApproval', () => {
        it('should return false when triager and approver are different', async () => {
            mockPrisma.reportStatusTransition.findMany.mockResolvedValue([
                { newStatus: 'TRIAGED', changedBy: 'admin-1' },
                { newStatus: 'ACCEPTED', changedBy: 'admin-2' },
            ]);
            const blocked = await engine.checkSelfApproval('report-1', 'admin-2');
            expect(blocked).toBe(false);
        });

        it('should flag with CRITICAL when same admin triages and approves', async () => {
            mockPrisma.reportStatusTransition.findMany.mockResolvedValue([
                { newStatus: 'TRIAGED', changedBy: 'admin-1' },
                { newStatus: 'ACCEPTED', changedBy: 'admin-1' },
            ]);
            const blocked = await engine.checkSelfApproval('report-1', 'admin-1');
            expect(blocked).toBe(true);
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'INSIDER_THREAT',
                    severity: 'CRITICAL',
                }),
            );
        });
    });
});
