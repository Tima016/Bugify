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
var EscrowReconciliationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowReconciliationProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const alert_service_1 = require("../../common/security/alert.service");
let EscrowReconciliationProcessor = EscrowReconciliationProcessor_1 = class EscrowReconciliationProcessor extends bullmq_1.WorkerHost {
    prisma;
    alertService;
    logger = new common_1.Logger(EscrowReconciliationProcessor_1.name);
    constructor(prisma, alertService) {
        super();
        this.prisma = prisma;
        this.alertService = alertService;
    }
    async process(job) {
        this.logger.log('Starting escrow reconciliation...');
        await this.verifyLedgerBalance();
        await this.verifyCompanyEscrows();
        await this.detectOrphanedPayouts();
        this.logger.log('Escrow reconciliation complete');
    }
    async verifyLedgerBalance() {
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
            const frozen = await this.prisma.payoutRequest.updateMany({
                where: { status: 'PENDING' },
                data: { status: 'REJECTED', notes: 'AUTO-FROZEN: ledger inconsistency detected' },
            });
            this.logger.error(`Auto-froze ${frozen.count} pending payouts due to ledger inconsistency`);
        }
        else {
            this.logger.log(`Ledger balanced: debits=$${totalDebits.toFixed(2)}, credits=$${totalCredits.toFixed(2)}`);
        }
    }
    async verifyCompanyEscrows() {
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
                    cooldownMs: 24 * 60 * 60 * 1000,
                });
            }
        }
    }
    async detectOrphanedPayouts() {
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
};
exports.EscrowReconciliationProcessor = EscrowReconciliationProcessor;
exports.EscrowReconciliationProcessor = EscrowReconciliationProcessor = EscrowReconciliationProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('scheduled-jobs'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        alert_service_1.AlertService])
], EscrowReconciliationProcessor);
//# sourceMappingURL=escrow-reconciliation.processor.js.map