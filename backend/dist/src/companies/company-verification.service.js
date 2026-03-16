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
var CompanyVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyVerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const dns_1 = require("dns");
const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'throwaway.email',
    'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
    'dispostable.com', 'mailnesia.com', 'maildrop.cc', 'discard.email',
    'tempr.email', 'fakeinbox.com', 'trashmail.com', 'getnada.com',
    '10minutemail.com', 'temp-mail.org', 'mailcatch.com', 'mohmal.com',
]);
const FREE_EMAIL_DOMAINS = new Set([
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
]);
let CompanyVerificationService = CompanyVerificationService_1 = class CompanyVerificationService {
    prisma;
    logger = new common_1.Logger(CompanyVerificationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    isDisposableEmail(email) {
        const domain = email.split('@')[1]?.toLowerCase();
        return DISPOSABLE_DOMAINS.has(domain);
    }
    isFreeEmail(email) {
        const domain = email.split('@')[1]?.toLowerCase();
        return FREE_EMAIL_DOMAINS.has(domain);
    }
    validateCompanyEmail(email) {
        if (this.isDisposableEmail(email)) {
            return { valid: false, warning: 'Disposable emails are not allowed for company accounts' };
        }
        if (this.isFreeEmail(email)) {
            return { valid: true, warning: 'Free email detected — corporate email recommended for verification' };
        }
        return { valid: true };
    }
    async initiateDomainVerification(companyId, domain) {
        const token = `bugify-verify=${(0, crypto_1.randomUUID)()}`;
        await this.prisma.company.update({
            where: { id: companyId },
            data: {
                domainVerifyToken: token,
                domainVerifyStatus: 'PENDING',
                websiteUrl: `https://${domain}`,
            },
        });
        return {
            instructions: 'Add a DNS TXT record to verify domain ownership',
            record: {
                type: 'TXT',
                host: `_bugify.${domain}`,
                value: token,
            },
            expiresIn: '72 hours',
        };
    }
    async checkDomainVerification(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { domainVerifyToken: true, websiteUrl: true },
        });
        if (!company?.domainVerifyToken || !company?.websiteUrl) {
            throw new common_1.BadRequestException('No pending domain verification');
        }
        const domain = company.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const host = `_bugify.${domain}`;
        try {
            const records = await dns_1.promises.resolveTxt(host);
            const flat = records.flat();
            if (flat.includes(company.domainVerifyToken)) {
                await this.prisma.company.update({
                    where: { id: companyId },
                    data: {
                        domainVerifyStatus: 'VERIFIED',
                        domainVerifiedAt: new Date(),
                    },
                });
                this.logger.log(`Domain verified for company ${companyId}: ${domain}`);
                return true;
            }
            this.logger.warn(`DNS TXT record not found for ${host}`);
            return false;
        }
        catch (err) {
            this.logger.warn(`DNS lookup failed for ${host}: ${err.message}`);
            return false;
        }
    }
    async calculateOnboardingRisk(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: {
                billingEmail: true, taxId: true, websiteUrl: true,
                domainVerifyStatus: true, companySize: true,
            },
        });
        if (!company)
            return 100;
        let score = 0;
        if (company.billingEmail) {
            if (this.isDisposableEmail(company.billingEmail))
                score += 40;
            else if (this.isFreeEmail(company.billingEmail))
                score += 10;
            else
                score -= 20;
        }
        else {
            score += 15;
        }
        if (company.domainVerifyStatus === 'VERIFIED')
            score -= 30;
        else
            score += 10;
        if (company.taxId)
            score -= 15;
        else
            score += 15;
        if (!company.websiteUrl)
            score += 10;
        score = Math.max(0, Math.min(100, score));
        await this.prisma.company.update({
            where: { id: companyId },
            data: { onboardingRiskScore: score },
        });
        return score;
    }
};
exports.CompanyVerificationService = CompanyVerificationService;
exports.CompanyVerificationService = CompanyVerificationService = CompanyVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyVerificationService);
//# sourceMappingURL=company-verification.service.js.map