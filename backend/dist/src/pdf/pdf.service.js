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
exports.PDFService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = require("fs");
const path_1 = require("path");
let PDFService = class PDFService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateReportPDF(reportId) {
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
        const filepath = (0, path_1.join)(process.cwd(), 'temp', filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default();
            const stream = (0, fs_1.createWriteStream)(filepath);
            doc.pipe(stream);
            doc.fontSize(20).text('UzSecure Bug Bounty Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12);
            doc.text(`Report ID: ${report.id}`);
            doc.text(`Title: ${report.title}`);
            doc.text(`Severity: ${report.severity}`);
            doc.text(`Status: ${report.status}`);
            doc.text(`Submitted by: ${report.researcher.username}`);
            doc.text(`Program: ${report.program.programName}`);
            doc.text(`Date: ${report.createdAt.toLocaleDateString()}`);
            doc.moveDown();
            doc.fontSize(14).text('Description:', { underline: true });
            doc.fontSize(11).text(report.description);
            doc.moveDown();
            if (report.reproductionSteps) {
                doc.fontSize(14).text('Steps to Reproduce:', { underline: true });
                doc.fontSize(11).text(report.reproductionSteps);
                doc.moveDown();
            }
            if (report.impactAnalysis) {
                doc.fontSize(14).text('Impact:', { underline: true });
                doc.fontSize(11).text(report.impactAnalysis);
            }
            doc.end();
            stream.on('finish', () => resolve(filepath));
            stream.on('error', reject);
        });
    }
    async generateInvoicePDF(paymentId) {
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
        const filepath = (0, path_1.join)(process.cwd(), 'temp', filename);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default();
            const stream = (0, fs_1.createWriteStream)(filepath);
            doc.pipe(stream);
            doc.fontSize(20).text('UzSecure Payment Invoice', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12);
            doc.text(`Invoice Number: INV-${payment.id}`);
            doc.text(`Date: ${payment.createdAt.toLocaleDateString()}`);
            doc.text(`Recipient: ${payment.researcher.username}`);
            doc.text(`Amount: ${payment.amount} ${payment.currency}`);
            doc.text(`Status: ${payment.status}`);
            doc.moveDown();
            doc.fontSize(10).text('Thank you for using UzSecure!', { align: 'center' });
            doc.end();
            stream.on('finish', () => resolve(filepath));
            stream.on('error', reject);
        });
    }
};
exports.PDFService = PDFService;
exports.PDFService = PDFService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PDFService);
//# sourceMappingURL=pdf.service.js.map