-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('RESEARCHER', 'COMPANY', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NOT_SUBMITTED');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('BASIC', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('PUBLIC', 'PRIVATE', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DisclosurePolicy" AS ENUM ('FULL', 'LIMITED', 'NONE');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NEW', 'TRIAGED', 'NEEDS_MORE_INFO', 'ACCEPTED', 'DUPLICATE', 'INFORMATIVE', 'NOT_APPLICABLE', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TriageStatus" AS ENUM ('PENDING', 'TRIAGED', 'RETESTING');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('P0', 'P1', 'P2', 'P3', 'P4');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'PAYPAL', 'CRYPTOCURRENCY', 'UZCARD', 'HUMO');

-- CreateEnum
CREATE TYPE "RetestStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "CommentVisibility" AS ENUM ('PUBLIC', 'TEAM_ONLY', 'ADMINS_ONLY');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'UZ',
    "profilePictureUrl" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'RESEARCHER',
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "kycDocuments" JSONB,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "backupCodes" JSONB,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'uz',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tashkent',
    "notificationPreferences" JSONB,
    "socialLinks" JSONB,
    "skills" TEXT[],
    "certifications" JSONB,
    "lastLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "taxId" TEXT,
    "websiteUrl" TEXT,
    "industry" TEXT,
    "companySize" "CompanySize",
    "logoUrl" TEXT,
    "description" TEXT,
    "headquartersLocation" TEXT,
    "foundedYear" INTEGER,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationDocuments" JSONB,
    "billingEmail" TEXT,
    "supportEmail" TEXT,
    "securityEmail" TEXT,
    "paymentMethod" JSONB,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'BASIC',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalPrograms" INTEGER NOT NULL DEFAULT 0,
    "totalPaidOut" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "averageResponseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "programType" "ProgramType" NOT NULL DEFAULT 'PUBLIC',
    "status" "ProgramStatus" NOT NULL DEFAULT 'ACTIVE',
    "launchDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scope" JSONB NOT NULL,
    "outOfScope" JSONB,
    "targetTypes" TEXT[],
    "vulnerabilityTypes" TEXT[],
    "responseEfficiency" JSONB,
    "rulesAndGuidelines" TEXT,
    "safeHarborPolicy" TEXT,
    "disclosurePolicy" "DisclosurePolicy" NOT NULL DEFAULT 'LIMITED',
    "disclosureTimeline" INTEGER,
    "rewardStructure" JSONB,
    "minimumPayout" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maximumPayout" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "averagePayout" DECIMAL(10,2),
    "hallOfFameEnabled" BOOLEAN NOT NULL DEFAULT true,
    "swagRewardsAvailable" BOOLEAN NOT NULL DEFAULT false,
    "totalReportsReceived" INTEGER NOT NULL DEFAULT 0,
    "totalValidReports" INTEGER NOT NULL DEFAULT 0,
    "totalPaidOut" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "averageTriageTime" INTEGER,
    "averageResolutionTime" INTEGER,
    "researcherRating" DECIMAL(2,1),
    "managedBy" TEXT,
    "teamMembers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vulnerabilityType" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "cvssScore" DECIMAL(3,1),
    "cvssVector" TEXT,
    "description" TEXT NOT NULL,
    "impactAnalysis" TEXT NOT NULL,
    "reproductionSteps" TEXT NOT NULL,
    "proofOfConcept" TEXT,
    "attachments" JSONB,
    "affectedAssets" JSONB,
    "discoveredDate" TIMESTAMP(3) NOT NULL,
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReportStatus" NOT NULL DEFAULT 'NEW',
    "triageStatus" "TriageStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority",
    "bountyAmount" DECIMAL(10,2),
    "bonusAmount" DECIMAL(10,2),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "collaborators" JSONB,
    "isDisclosed" BOOLEAN NOT NULL DEFAULT false,
    "disclosedAt" TIMESTAMP(3),
    "publicDisclosureUrl" TEXT,
    "duplicateOf" TEXT,
    "weaknessCwe" TEXT,
    "weaknessOwasp" TEXT,
    "retestRequested" BOOLEAN NOT NULL DEFAULT false,
    "retestStatus" "RetestStatus",
    "researcherImpactRating" INTEGER,
    "companyImpactRating" INTEGER,
    "timeToTriage" INTEGER,
    "timeToResolution" INTEGER,
    "timeToBounty" INTEGER,
    "internalNotes" TEXT,
    "tags" TEXT[],
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "CommentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "reactions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "amountInUzs" DECIMAL(12,2),
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentDetails" JSONB,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "invoiceNumber" TEXT,
    "invoiceUrl" TEXT,
    "taxWithheld" DECIMAL(10,2),
    "feeAmount" DECIMAL(10,2),
    "netAmount" DECIMAL(10,2),
    "initiatedBy" TEXT,
    "approvedBy" TEXT,
    "paidAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "sentViaEmail" BOOLEAN NOT NULL DEFAULT false,
    "sentViaSms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "changes" JSONB,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "companies_companyName_key" ON "companies"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "companies_taxId_key" ON "companies"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "programs_slug_key" ON "programs"("slug");

-- CreateIndex
CREATE INDEX "programs_companyId_idx" ON "programs"("companyId");

-- CreateIndex
CREATE INDEX "programs_slug_idx" ON "programs"("slug");

-- CreateIndex
CREATE INDEX "programs_status_idx" ON "programs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reports_reportNumber_key" ON "reports"("reportNumber");

-- CreateIndex
CREATE INDEX "reports_programId_idx" ON "reports"("programId");

-- CreateIndex
CREATE INDEX "reports_researcherId_idx" ON "reports"("researcherId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_severity_idx" ON "reports"("severity");

-- CreateIndex
CREATE INDEX "reports_reportNumber_idx" ON "reports"("reportNumber");

-- CreateIndex
CREATE INDEX "comments_reportId_idx" ON "comments"("reportId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_invoiceNumber_key" ON "payments"("invoiceNumber");

-- CreateIndex
CREATE INDEX "payments_reportId_idx" ON "payments"("reportId");

-- CreateIndex
CREATE INDEX "payments_researcherId_idx" ON "payments"("researcherId");

-- CreateIndex
CREATE INDEX "payments_companyId_idx" ON "payments"("companyId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_idx" ON "audit_logs"("resourceType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_managedBy_fkey" FOREIGN KEY ("managedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
