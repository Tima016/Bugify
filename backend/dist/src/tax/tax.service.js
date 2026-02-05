"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxService = void 0;
const common_1 = require("@nestjs/common");
let TaxService = class TaxService {
    calculateIncomeTax(amount) {
        const taxRate = 0.12;
        const taxAmount = amount * taxRate;
        const netAmount = amount - taxAmount;
        return {
            grossAmount: amount,
            taxAmount,
            netAmount,
            taxRate,
        };
    }
    calculateVAT(amount) {
        const taxRate = 0.12;
        const taxAmount = amount * taxRate;
        const grossAmount = amount + taxAmount;
        return {
            grossAmount,
            taxAmount,
            netAmount: amount,
            taxRate,
        };
    }
    async generateTaxInvoice(paymentId, userId) {
        return {
            invoiceNumber: `INV-${Date.now()}`,
            paymentId,
            userId,
            generatedAt: new Date(),
            taxAuthority: 'State Tax Committee of Uzbekistan',
        };
    }
};
exports.TaxService = TaxService;
exports.TaxService = TaxService = __decorate([
    (0, common_1.Injectable)()
], TaxService);
//# sourceMappingURL=tax.service.js.map