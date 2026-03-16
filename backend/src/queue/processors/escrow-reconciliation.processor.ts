// ============================================
// Escrow Reconciliation Job
// Daily verification of ledger consistency + per-company escrow balance
// ============================================
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertService } from '../../common/security/alert.service';

@Processor('scheduled-jobs')
export class EscrowReconciliationProcessor extends WorkerHost {
    private readonly logger = new Logger(EscrowReconciliationProcessor.name);

    constructor(
        private prisma: PrismaService,
        private alertService: AlertService,
    ) {
        super();
    }

    async process(job: Job): Promise<void> {
        this.logger.log('Starting escrow reconciliation...');

        // 1. Global ledger consistency — SUM(DEBIT) must equal SUM(CREDIT)
        await this.verifyLedgerBalance();

        // 2. Per-company escrow verification
        await this.verifyCompanyEscrows();

        // 3. Detect orphaned payouts (payout without ledger entry)
        await this.detectOrphanedPayouts();

        this.logger.log('Escrow reconciliation complete');
    }

    /**
     * Global double-entry verification: total debits == total credits
     */
    private async verifyLedgerBalance(): Promise<void> {
        const [debits, credits] = await Promise.all([
            this.prisma.ledgerEntry.aggregate({
                where: { type: 'DEBIT' },
                _sum: { amount: true },
            }),
            this.prisma.ledgerEntry.aggregate({
                where: { type: 'CREDIT' },
                _sum: { amount: true },
            }),
        ]);

        const totalDebits = Number(debits._sum.amount || 0);
        const totalCredits = Number(credits._sum.amount || 0);
        const diff = Math.abs(totalDebits - totalCredits);

        if (diff > 0.01) {
            this.logger.error(`LEDGER INCONSISTENCY: debits=$${totalDebits}, credits=$${totalCredits}, diff=$${diff}`);

            await this.alertService.fire({
                category: 'PAYMENT_FRAUD',
                severity: 'CRITICAL',
                title: `LEDGER INCONSISTENT: diff=$${diff.toFixed(2)}`,
                description: `Total debits ($${totalDebits.toFixed(2)}) ≠ total credits ($${totalCredits.toFixed(2)}). Difference: $${diff.toFixed(2)}.`,
                metadata: { totalDebits, totalCredits, diff },
            });

            // Auto-freeze all pending payouts platform-wide
            const frozen = await this.prisma.payoutRequest.updateMany({
                where: { status: 'PENDING' },
                data: { status: 'REJECTED', notes: 'AUTO-FROZEN: ledger inconsistency detected' },
            });

            this.logger.error(`Auto-froze ${frozen.count} pending payouts due to ledger inconsistency`);
        } else {
            this.logger.log(`Ledger balanced: debits=$${totalDebits.toFixed(2)}, credits=$${totalCredits.toFixed(2)}`);
        }
    }

    /**
     * Per-company: verify escrow balance matches ledger sum
     */
    private async verifyCompanyEscrows(): Promise<void> {
        const companies = await this.prisma.company.findMany({
            select: { id: true, companyName: true, totalPaidOut: true },
        });

        for (const company of companies) {
            const ledger = await this.prisma.ledgerEntry.aggregate({
                where: { accountId: `escrow:${company.id}` },
                _sum: { amount: true },
            });

            const ledgerBalance = Number(ledger._sum.amount || 0);
            const recorded = Number(company.totalPaidOut);
            const diff = Math.abs(ledgerBalance - recorded);

            if (diff > 0.01) {
                await this.alertService.fire({
                    category: 'PAYMENT_FRAUD',
                    severity: 'HIGH',
                    title: `Escrow mismatch: ${company.companyName}`,
                    description: `Ledger: $${ledgerBalance.toFixed(2)}, Recorded: $${recorded.toFixed(2)}, Diff: $${diff.toFixed(2)}`,
                    metadata: { companyId: company.id, ledgerBalance, recorded, diff },
                    cooldownKey: `escrow_mismatch:${company.id}`,
                    cooldownMs: 24 * 60 * 60 * 1000, // Daily
                });
            }
        }
    }

    /**
     * Detect completed payouts without matching ledger entries
     */
    private async detectOrphanedPayouts(): Promise<void> {
        const completedPayouts = await this.prisma.payoutRequest.findMany({
            where: { status: 'COMPLETED' },
            select: { id: true, amount: true, researcherId: true },
        });

        for (const payout of completedPayouts) {
            const entry = await this.prisma.ledgerEntry.findFirst({
                where: { referenceId: payout.id, referenceType: 'REPORT_PAYOUT' },
            });

            if (!entry) {
                await this.alertService.fire({
                    category: 'PAYMENT_FRAUD',
                    severity: 'CRITICAL',
                    title: `Orphaned payout: ${payout.id} (no ledger entry)`,
                    description: `Payout ${payout.id} ($${payout.amount}) marked COMPLETED but has no matching ledger entry.`,
                    metadata: { payoutId: payout.id, amount: payout.amount, researcherId: payout.researcherId },
                    cooldownKey: `orphan_payout:${payout.id}`,
                });
            }
        }
    }
}
