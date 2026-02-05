-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyId" TEXT;

-- CreateIndex
CREATE INDEX "users_companyId_idx" ON "users"("companyId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
