// ============================================
// Company Verification Service
// DNS TXT domain verification + disposable email detection
// ============================================
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { promises as dns } from 'dns';

// Top disposable email domains — in production, load from disposable-email-domains npm
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

@Injectable()
export class CompanyVerificationService {
    private readonly logger = new Logger(CompanyVerificationService.name);

    constructor(private prisma: PrismaService) { }

    // ---- Email Validation ----

    isDisposableEmail(email: string): boolean {
        const domain = email.split('@')[1]?.toLowerCase();
        return DISPOSABLE_DOMAINS.has(domain);
    }

    isFreeEmail(email: string): boolean {
        const domain = email.split('@')[1]?.toLowerCase();
        return FREE_EMAIL_DOMAINS.has(domain);
    }

    /**
     * Validate company email — block disposable, warn on free email.
     */
    validateCompanyEmail(email: string): { valid: boolean; warning?: string } {
        if (this.isDisposableEmail(email)) {
            return { valid: false, warning: 'Disposable emails are not allowed for company accounts' };
        }
        if (this.isFreeEmail(email)) {
            return { valid: true, warning: 'Free email detected — corporate email recommended for verification' };
        }
        return { valid: true };
    }

    // ---- Domain Verification via DNS TXT ----

    /**
     * Start domain verification: generate a token and return DNS instructions.
     */
    async initiateDomainVerification(companyId: string, domain: string) {
        const token = `bugify-verify=${randomUUID()}`;

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

    /**
     * Check if the DNS TXT record matches the expected token.
     */
    async checkDomainVerification(companyId: string): Promise<boolean> {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { domainVerifyToken: true, websiteUrl: true },
        });

        if (!company?.domainVerifyToken || !company?.websiteUrl) {
            throw new BadRequestException('No pending domain verification');
        }

        const domain = company.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const host = `_bugify.${domain}`;

        try {
            const records = await dns.resolveTxt(host);
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
        } catch (err) {
            this.logger.warn(`DNS lookup failed for ${host}: ${err.message}`);
            return false;
        }
    }

    // ---- Onboarding Risk Scoring ----

    /**
     * Calculate onboarding risk score for a new company.
     * Higher = riskier. Score > 50 → manual admin review required.
     */
    async calculateOnboardingRisk(companyId: string): Promise<number> {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: {
                billingEmail: true, taxId: true, websiteUrl: true,
                domainVerifyStatus: true, companySize: true,
            },
        });

        if (!company) return 100;

        let score = 0;

        // Email signals
        if (company.billingEmail) {
            if (this.isDisposableEmail(company.billingEmail)) score += 40;
            else if (this.isFreeEmail(company.billingEmail)) score += 10;
            else score -= 20; // Corporate email bonus
        } else {
            score += 15;
        }

        // Domain verification
        if (company.domainVerifyStatus === 'VERIFIED') score -= 30;
        else score += 10;

        // Tax ID
        if (company.taxId) score -= 15;
        else score += 15;

        // Website
        if (!company.websiteUrl) score += 10;

        score = Math.max(0, Math.min(100, score));

        await this.prisma.company.update({
            where: { id: companyId },
            data: { onboardingRiskScore: score },
        });

        return score;
    }
}
