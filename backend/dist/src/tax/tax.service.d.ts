interface TaxCalculation {
    grossAmount: number;
    taxAmount: number;
    netAmount: number;
    taxRate: number;
}
export declare class TaxService {
    calculateIncomeTax(amount: number): TaxCalculation;
    calculateVAT(amount: number): TaxCalculation;
    generateTaxInvoice(paymentId: string, userId: string): Promise<any>;
}
export {};
