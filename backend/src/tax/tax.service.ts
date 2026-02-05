import { Injectable } from '@nestjs/common';

interface TaxCalculation {
    grossAmount: number;
    taxAmount: number;
    netAmount: number;
    taxRate: number;
}

@Injectable()
export class TaxService {
    /**
     * Calculate Uzbekistan income tax (12% for individuals)
     */
    calculateIncomeTax(amount: number): TaxCalculation {
        const taxRate = 0.12; // 12% income tax in Uzbekistan
        const taxAmount = amount * taxRate;
        const netAmount = amount - taxAmount;

        return {
            grossAmount: amount,
            taxAmount,
            netAmount,
            taxRate,
        };
    }

    /**
     * Calculate VAT (12% in Uzbekistan)
     */
    calculateVAT(amount: number): TaxCalculation {
        const taxRate = 0.12; // 12% VAT
        const taxAmount = amount * taxRate;
        const grossAmount = amount + taxAmount;

        return {
            grossAmount,
            taxAmount,
            netAmount: amount,
            taxRate,
        };
    }

    /**
     * Generate tax invoice
     */
    async generateTaxInvoice(paymentId: string, userId: string): Promise<any> {
        // In production, integrate with Uzbekistan tax system
        return {
            invoiceNumber: `INV-${Date.now()}`,
            paymentId,
            userId,
            generatedAt: new Date(),
            taxAuthority: 'State Tax Committee of Uzbekistan',
        };
    }
}
