-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentBalance" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "payout_requests" (
    "id" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" "PaymentMethod" NOT NULL,
    "destination" JSONB NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "transactionRef" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
