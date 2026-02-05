import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class PDFService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate report PDF
     */
    async generateReportPDF(reportId: string): Promise<string> {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
            include: {
                researcher: true,
                program: true,
            },
        });

        if (!report) {
            throw new Error('Report not found');
        }

        const filename = `report-${reportId}.pdf`;
        const filepath = join(process.cwd(), 'temp', filename);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const stream = createWriteStream(filepath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('UzSecure Bug Bounty Report', { align: 'center' });
            doc.moveDown();

            // Report details
            doc.fontSize(12);
            doc.text(`Report ID: ${report.id}`);
            doc.text(`Title: ${report.title}`);
            doc.text(`Severity: ${report.severity}`);
            doc.text(`Status: ${report.status}`);
            doc.text(`Submitted by: ${report.researcher.username}`);
            doc.text(`Program: ${report.program.programName}`);
            doc.text(`Date: ${report.createdAt.toLocaleDateString()}`);
            doc.moveDown();

            // Description
            doc.fontSize(14).text('Description:', { underline: true });
            doc.fontSize(11).text(report.description);
            doc.moveDown();

            // Steps to reproduce
            if (report.reproductionSteps) {
                doc.fontSize(14).text('Steps to Reproduce:', { underline: true });
                doc.fontSize(11).text(report.reproductionSteps);
                doc.moveDown();
            }

            // Impact
            if (report.impactAnalysis) {
                doc.fontSize(14).text('Impact:', { underline: true });
                doc.fontSize(11).text(report.impactAnalysis);
            }

            doc.end();

            stream.on('finish', () => resolve(filepath));
            stream.on('error', reject);
        });
    }

    /**
     * Generate payment invoice PDF
     */
    async generateInvoicePDF(paymentId: string): Promise<string> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                researcher: true,
            },
        });

        if (!payment) {
            throw new Error('Payment not found');
        }

        const filename = `invoice-${paymentId}.pdf`;
        const filepath = join(process.cwd(), 'temp', filename);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const stream = createWriteStream(filepath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('UzSecure Payment Invoice', { align: 'center' });
            doc.moveDown();

            // Invoice details
            doc.fontSize(12);
            doc.text(`Invoice Number: INV-${payment.id}`);
            doc.text(`Date: ${payment.createdAt.toLocaleDateString()}`);
            doc.text(`Recipient: ${payment.researcher.username}`);
            doc.text(`Amount: ${payment.amount} ${payment.currency}`);
            doc.text(`Status: ${payment.status}`);
            doc.moveDown();

            // Footer
            doc.fontSize(10).text('Thank you for using UzSecure!', { align: 'center' });

            doc.end();

            stream.on('finish', () => resolve(filepath));
            stream.on('error', reject);
        });
    }
}
