import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    async create(companyId: string, amount: number, items: any) {
        // Create an invoice record
        return this.prisma.invoice.create({
            data: {
                companyId,
                amount,
                status: 'DRAFT',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days due
                items: items,
            },
        });
    }

    async generatePdf(invoiceId: string): Promise<Buffer> {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { company: true },
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            // PDF Content
            doc.fontSize(24).text('INVOICE', { align: 'center' });
            doc.moveDown();

            doc.fontSize(14).text(`UzSecure Bug Bounty Platform`);
            doc.moveDown();

            doc.text(`Invoice ID: ${invoice.id}`);
            doc.text(`Date: ${invoice.createdAt.toDateString()}`);
            doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
            doc.moveDown();

            doc.text(`Bill To:`);
            doc.text(`${invoice.company.companyName}`);
            doc.text(`${invoice.company.billingEmail || invoice.company.supportEmail || 'N/A'}`);
            doc.moveDown();

            doc.text('Items:');
            // Assuming items is an array of strings or objects. Safe serialization.
            const items = Array.isArray(invoice.items) ? invoice.items : [invoice.items];
            items.forEach((item: any, index: number) => {
                const desc = typeof item === 'string' ? item : JSON.stringify(item);
                doc.text(`${index + 1}. ${desc}`);
            });
            doc.moveDown();

            doc.fontSize(16).text(`Total Amount: $${Number(invoice.amount).toFixed(2)}`, { align: 'right' });

            doc.end();
        });
    }
}
