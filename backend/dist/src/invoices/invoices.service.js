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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pdfkit_1 = __importDefault(require("pdfkit"));
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, amount, items) {
        return this.prisma.invoice.create({
            data: {
                companyId,
                amount,
                status: 'DRAFT',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                items: items,
            },
        });
    }
    async generatePdf(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { company: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default();
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));
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
            const items = Array.isArray(invoice.items) ? invoice.items : [invoice.items];
            items.forEach((item, index) => {
                const desc = typeof item === 'string' ? item : JSON.stringify(item);
                doc.text(`${index + 1}. ${desc}`);
            });
            doc.moveDown();
            doc.fontSize(16).text(`Total Amount: $${Number(invoice.amount).toFixed(2)}`, { align: 'right' });
            doc.end();
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map