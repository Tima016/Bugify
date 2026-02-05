"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const passwordHash = await bcrypt.hash('password123', 12);
    const researcherPassword = await bcrypt.hash('researcher123', 12);
    const companyPassword = await bcrypt.hash('company123', 12);
    const adminPassword = await bcrypt.hash('admin123', 12);
    const researcher = await prisma.user.upsert({
        where: { email: 'researcher@uzsecure.uz' },
        update: {},
        create: {
            email: 'researcher@uzsecure.uz',
            username: 'researcher',
            passwordHash: researcherPassword,
            firstName: 'Researcher',
            lastName: 'User',
            role: 'RESEARCHER',
            reputationScore: 850,
            totalEarnings: 15000,
            isVerified: true,
            isEmailVerified: true,
            bio: 'Security researcher specializing in web application security',
            skills: ['Web Security', 'API Testing', 'XSS', 'SQL Injection'],
        },
    });
    const admin = await prisma.user.upsert({
        where: { email: 'admin@uzsecure.uz' },
        update: {},
        create: {
            email: 'admin@uzsecure.uz',
            username: 'admin',
            passwordHash: adminPassword,
            firstName: 'System',
            lastName: 'Admin',
            phoneNumber: '+998901234567',
            role: 'ADMIN',
            reputationScore: 0,
            totalEarnings: 0,
            isVerified: true,
            isEmailVerified: true,
            bio: 'Platform administrator',
        },
    });
    console.log('✅ Created users:');
    console.log(' - Researcher:', researcher.email);
    console.log(' - Admin:', admin.email);
    const company1 = await prisma.company.upsert({
        where: { companyName: 'Telegram' },
        update: {},
        create: {
            companyName: 'Telegram',
            legalName: 'Telegram FZ-LLC',
            websiteUrl: 'https://telegram.org',
            industry: 'Technology',
            companySize: 'LARGE',
            logoUrl: 'https://telegram.org/img/t_logo.png',
            description: 'Cloud-based instant messaging service',
            headquartersLocation: 'Dubai, UAE',
            foundedYear: 2013,
            verificationStatus: 'VERIFIED',
            subscriptionPlan: 'ENTERPRISE',
            subscriptionStatus: 'ACTIVE',
            totalPaidOut: 500000,
        },
    });
    const company2 = await prisma.company.upsert({
        where: { companyName: 'UzCard' },
        update: {},
        create: {
            companyName: 'UzCard',
            legalName: 'UzCard LLC',
            websiteUrl: 'https://uzcard.uz',
            industry: 'Financial Services',
            companySize: 'LARGE',
            logoUrl: 'https://uzcard.uz/logo.png',
            description: 'National payment system of Uzbekistan',
            headquartersLocation: 'Tashkent, Uzbekistan',
            foundedYear: 2001,
            verificationStatus: 'VERIFIED',
            subscriptionPlan: 'PROFESSIONAL',
            subscriptionStatus: 'ACTIVE',
            totalPaidOut: 150000,
        },
    });
    const company3 = await prisma.company.upsert({
        where: { companyName: 'Uzum' },
        update: {},
        create: {
            companyName: 'Uzum',
            legalName: 'Uzum Technologies LLC',
            websiteUrl: 'https://uzum.uz',
            industry: 'E-commerce',
            companySize: 'MEDIUM',
            logoUrl: 'https://uzum.uz/logo.png',
            description: 'Leading e-commerce platform in Uzbekistan',
            headquartersLocation: 'Tashkent, Uzbekistan',
            foundedYear: 2020,
            verificationStatus: 'VERIFIED',
            subscriptionPlan: 'PROFESSIONAL',
            subscriptionStatus: 'ACTIVE',
            totalPaidOut: 75000,
        },
    });
    console.log('✅ Created companies:', company1.companyName, company2.companyName, company3.companyName);
    const companyUser = await prisma.user.upsert({
        where: { email: 'company@uzsecure.uz' },
        update: {},
        create: {
            email: 'company@uzsecure.uz',
            username: 'company_admin',
            passwordHash: companyPassword,
            firstName: 'Company',
            lastName: 'Admin',
            role: 'COMPANY',
            companyId: company2.id,
            isVerified: true,
            isEmailVerified: true,
            bio: 'Company representative',
        },
    });
    console.log(' - Company User (linked to UzCard):', companyUser.email);
    const program1 = await prisma.program.upsert({
        where: { slug: 'telegram-security' },
        update: {},
        create: {
            companyId: company1.id,
            programName: 'Telegram Security Program',
            slug: 'telegram-security',
            description: 'Help us keep Telegram secure by reporting vulnerabilities in our messaging platform, APIs, and infrastructure.',
            programType: 'PUBLIC',
            status: 'ACTIVE',
            scope: [
                { url: 'https://telegram.org', type: 'Web Application', eligibleForBounty: true },
                { url: 'https://web.telegram.org', type: 'Web Application', eligibleForBounty: true },
                { url: 'https://core.telegram.org/api', type: 'API', eligibleForBounty: true },
                { url: '*.telegram.org', type: 'Wildcard Domain', eligibleForBounty: true },
            ],
            outOfScope: [
                'Social engineering attacks',
                'Physical security issues',
                'Denial of Service (DoS) attacks',
                'Spam or social abuse',
            ],
            targetTypes: ['Web Application', 'API', 'Mobile App', 'Desktop App'],
            vulnerabilityTypes: ['XSS', 'SQL Injection', 'CSRF', 'Authentication Bypass', 'RCE', 'IDOR', 'SSRF'],
            disclosurePolicy: 'LIMITED',
            disclosureTimeline: 90,
            minimumPayout: 100,
            maximumPayout: 20000,
            currency: 'USD',
            averagePayout: 2500,
            hallOfFameEnabled: true,
            swagRewardsAvailable: true,
            totalReportsReceived: 450,
            totalValidReports: 180,
            totalPaidOut: 450000,
            averageTriageTime: 24,
            averageResolutionTime: 168,
            researcherRating: 4.8,
        },
    });
    const program2 = await prisma.program.upsert({
        where: { slug: 'uzcard-security' },
        update: {},
        create: {
            companyId: company2.id,
            programName: 'UzCard Security Program',
            slug: 'uzcard-security',
            description: 'Secure the national payment system of Uzbekistan. Report vulnerabilities in our payment processing, mobile apps, and web platforms.',
            programType: 'PUBLIC',
            status: 'ACTIVE',
            scope: [
                { url: 'https://uzcard.uz', type: 'Web Application', eligibleForBounty: true },
                { url: 'https://api.uzcard.uz', type: 'API', eligibleForBounty: true },
                { url: 'UzCard Mobile App', type: 'Mobile App', eligibleForBounty: true },
            ],
            outOfScope: [
                'ATM physical security',
                'Card cloning (physical)',
                'Social engineering',
                'Third-party integrations',
            ],
            targetTypes: ['Web Application', 'API', 'Mobile App'],
            vulnerabilityTypes: ['Payment Bypass', 'Authentication Issues', 'Encryption Flaws', 'IDOR', 'XSS', 'SQL Injection'],
            disclosurePolicy: 'LIMITED',
            disclosureTimeline: 120,
            minimumPayout: 200,
            maximumPayout: 15000,
            currency: 'USD',
            averagePayout: 3000,
            hallOfFameEnabled: true,
            swagRewardsAvailable: false,
            totalReportsReceived: 120,
            totalValidReports: 45,
            totalPaidOut: 135000,
            averageTriageTime: 48,
            averageResolutionTime: 240,
            researcherRating: 4.5,
        },
    });
    const program3 = await prisma.program.upsert({
        where: { slug: 'uzum-marketplace-security' },
        update: {},
        create: {
            companyId: company3.id,
            programName: 'Uzum Marketplace Security',
            slug: 'uzum-marketplace-security',
            description: 'Help protect our e-commerce platform and customer data. We welcome reports on our web application, mobile apps, and payment systems.',
            programType: 'PUBLIC',
            status: 'ACTIVE',
            scope: [
                { url: 'https://uzum.uz', type: 'Web Application', eligibleForBounty: true },
                { url: 'https://seller.uzum.uz', type: 'Web Application', eligibleForBounty: true },
                { url: 'https://api.uzum.uz', type: 'API', eligibleForBounty: true },
                { url: 'Uzum Mobile App', type: 'Mobile App', eligibleForBounty: true },
            ],
            outOfScope: [
                'Price manipulation through legitimate features',
                'Spam or fake reviews',
                'Seller fraud',
                'Third-party seller applications',
            ],
            targetTypes: ['Web Application', 'API', 'Mobile App'],
            vulnerabilityTypes: ['XSS', 'SQL Injection', 'CSRF', 'IDOR', 'Payment Issues', 'Authentication Bypass'],
            disclosurePolicy: 'LIMITED',
            disclosureTimeline: 60,
            minimumPayout: 50,
            maximumPayout: 10000,
            currency: 'USD',
            averagePayout: 1500,
            hallOfFameEnabled: true,
            swagRewardsAvailable: true,
            totalReportsReceived: 200,
            totalValidReports: 80,
            totalPaidOut: 120000,
            averageTriageTime: 36,
            averageResolutionTime: 144,
            researcherRating: 4.6,
        },
    });
    console.log('✅ Created programs:', program1.slug, program2.slug, program3.slug);
    const report1 = await prisma.report.upsert({
        where: { reportNumber: 'RPT-2024-001' },
        update: {},
        create: {
            reportNumber: 'RPT-2024-001',
            programId: program1.id,
            researcherId: researcher.id,
            title: 'Stored XSS in User Profile Bio',
            vulnerabilityType: 'Cross-Site Scripting (XSS)',
            severity: 'HIGH',
            cvssScore: 7.5,
            cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:L/A:N',
            description: 'A stored XSS vulnerability exists in the user profile bio field, allowing attackers to inject malicious JavaScript that executes when other users view the profile.',
            impactAnalysis: 'An attacker can steal session tokens, perform actions on behalf of users, and potentially compromise user accounts.',
            reproductionSteps: '1. Navigate to profile settings\n2. Enter malicious payload in bio field: <script>alert(document.cookie)</script>\n3. Save profile\n4. Visit profile page as another user\n5. Observe JavaScript execution',
            proofOfConcept: 'Screenshot and video demonstration attached',
            discoveredDate: new Date('2024-01-15'),
            status: 'RESOLVED',
            triageStatus: 'TRIAGED',
            priority: 'P1',
            bountyAmount: 5000,
            paymentStatus: 'PAID',
            paymentDate: new Date('2024-02-01'),
            weaknessCwe: 'CWE-79',
            weaknessOwasp: 'A03:2021 – Injection',
            timeToTriage: 12,
            timeToResolution: 72,
            timeToBounty: 168,
            tags: ['XSS', 'Web Security', 'High Severity'],
            resolvedAt: new Date('2024-01-18'),
        },
    });
    const report2 = await prisma.report.upsert({
        where: { reportNumber: 'RPT-2024-002' },
        update: {},
        create: {
            reportNumber: 'RPT-2024-002',
            programId: program2.id,
            researcherId: researcher.id,
            title: 'IDOR in Payment Transaction History',
            vulnerabilityType: 'Insecure Direct Object Reference (IDOR)',
            severity: 'CRITICAL',
            cvssScore: 9.1,
            cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N',
            description: 'An IDOR vulnerability allows authenticated users to access payment transaction history of other users by manipulating the transaction ID parameter.',
            impactAnalysis: 'Attackers can view sensitive financial information including transaction amounts, dates, and recipient details of any user.',
            reproductionSteps: '1. Login to UzCard account\n2. Navigate to transaction history\n3. Intercept request and modify transaction_id parameter\n4. Observe unauthorized access to other users transactions',
            proofOfConcept: 'Burp Suite request/response screenshots attached',
            discoveredDate: new Date('2024-01-20'),
            status: 'ACCEPTED',
            triageStatus: 'TRIAGED',
            priority: 'P0',
            bountyAmount: 12000,
            paymentStatus: 'APPROVED',
            weaknessCwe: 'CWE-639',
            weaknessOwasp: 'A01:2021 – Broken Access Control',
            timeToTriage: 6,
            tags: ['IDOR', 'Critical', 'Payment Security'],
        },
    });
    console.log('✅ Created sample reports:', report1.reportNumber, report2.reportNumber);
    console.log('🎉 Database seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map