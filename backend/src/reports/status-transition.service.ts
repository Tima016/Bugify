// ============================================
// Report Status Transition Service
// Records every status change for audit trail and dispute resolution
// ============================================
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';

export interface TransitionParams {
    reportId: string;
    oldStatus: ReportStatus;
    newStatus: ReportStatus;
    changedBy: string;
    reason?: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class StatusTransitionService {
    private readonly logger = new Logger(StatusTransitionService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Record a status transition and update the report atomically.
     */
    async transition(params: TransitionParams) {
        const { reportId, oldStatus, newStatus, changedBy, reason, metadata } = params;

        return this.prisma.$transaction(async (tx) => {
            // Verify current status matches expected oldStatus (optimistic lock)
            const report = await tx.report.findUnique({ where: { id: reportId } });

            if (!report) {
                throw new Error(`Report ${reportId} not found`);
            }

            if (report.status !== oldStatus) {
                throw new Error(
                    `Status conflict: expected ${oldStatus}, found ${report.status}. Another user may have updated this report.`,
                );
            }

            // Record transition
            await tx.reportStatusTransition.create({
                data: {
                    reportId,
                    oldStatus,
                    newStatus,
                    changedBy,
                    reason,
                    metadata: metadata || undefined,
                },
            });

            // Update report status
            const updatedReport = await tx.report.update({
                where: { id: reportId },
                data: {
                    status: newStatus,
                    ...(newStatus === 'RESOLVED' && { resolvedAt: new Date() }),
                },
            });

            this.logger.log(
                `Report ${reportId}: ${oldStatus} → ${newStatus} by ${changedBy}`,
            );

            return updatedReport;
        });
    }

    /**
     * Get full status history for a report.
     */
    async getHistory(reportId: string) {
        return this.prisma.reportStatusTransition.findMany({
            where: { reportId },
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: { id: true, username: true, role: true },
                },
            },
        });
    }
}
