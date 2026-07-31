-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('STANDARD', 'TRIP');

-- CreateEnum
CREATE TYPE "CurrencyLotSourceType" AS ENUM ('FUNDING', 'CONVERSION');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE "TripSettings" (
    "id" SERIAL NOT NULL,
    "folderId" INTEGER NOT NULL,
    "baseCurrencyCode" VARCHAR(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripCurrencyAccount" (
    "id" SERIAL NOT NULL,
    "tripSettingsId" INTEGER NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL,
    "currentBalance" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripCurrencyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripFunding" (
    "id" SERIAL NOT NULL,
    "tripSettingsId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "note" TEXT,
    "fundingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripFunding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyConversion" (
    "id" SERIAL NOT NULL,
    "tripSettingsId" INTEGER NOT NULL,
    "fromAccountId" INTEGER NOT NULL,
    "toAccountId" INTEGER NOT NULL,
    "fromAmount" DECIMAL(20,4) NOT NULL,
    "toAmount" DECIMAL(20,4) NOT NULL,
    "effectiveRate" DECIMAL(24,10) NOT NULL,
    "feeAmount" DECIMAL(20,4),
    "note" TEXT,
    "conversionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrencyConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyLot" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "sourceType" "CurrencyLotSourceType" NOT NULL,
    "fundingId" INTEGER,
    "conversionId" INTEGER,
    "originalAmount" DECIMAL(20,4) NOT NULL,
    "remainingAmount" DECIMAL(20,4) NOT NULL,
    "unitCostInBaseCurrency" DECIMAL(24,10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyConversionAllocation" (
    "id" SERIAL NOT NULL,
    "conversionId" INTEGER NOT NULL,
    "sourceLotId" INTEGER NOT NULL,
    "allocatedAmount" DECIMAL(20,4) NOT NULL,
    "allocatedBaseAmount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyConversionAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripExpense" (
    "id" SERIAL NOT NULL,
    "tripSettingsId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "equivalentBaseAmount" DECIMAL(20,4) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripExpenseAllocation" (
    "id" SERIAL NOT NULL,
    "tripExpenseId" INTEGER NOT NULL,
    "sourceLotId" INTEGER NOT NULL,
    "allocatedAmount" DECIMAL(20,4) NOT NULL,
    "allocatedBaseAmount" DECIMAL(20,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripExpenseAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripSettings_folderId_key" ON "TripSettings"("folderId");

-- CreateIndex
CREATE INDEX "TripSettings_baseCurrencyCode_idx" ON "TripSettings"("baseCurrencyCode");

-- CreateIndex
CREATE INDEX "TripCurrencyAccount_tripSettingsId_idx" ON "TripCurrencyAccount"("tripSettingsId");

-- CreateIndex
CREATE INDEX "TripCurrencyAccount_currencyCode_idx" ON "TripCurrencyAccount"("currencyCode");

-- CreateIndex
CREATE UNIQUE INDEX "TripCurrencyAccount_tripSettingsId_currencyCode_key" ON "TripCurrencyAccount"("tripSettingsId", "currencyCode");

-- CreateIndex
CREATE INDEX "TripFunding_tripSettingsId_idx" ON "TripFunding"("tripSettingsId");

-- CreateIndex
CREATE INDEX "TripFunding_accountId_idx" ON "TripFunding"("accountId");

-- CreateIndex
CREATE INDEX "TripFunding_fundingDate_idx" ON "TripFunding"("fundingDate");

-- CreateIndex
CREATE INDEX "CurrencyConversion_tripSettingsId_idx" ON "CurrencyConversion"("tripSettingsId");

-- CreateIndex
CREATE INDEX "CurrencyConversion_fromAccountId_idx" ON "CurrencyConversion"("fromAccountId");

-- CreateIndex
CREATE INDEX "CurrencyConversion_toAccountId_idx" ON "CurrencyConversion"("toAccountId");

-- CreateIndex
CREATE INDEX "CurrencyConversion_conversionDate_idx" ON "CurrencyConversion"("conversionDate");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyLot_fundingId_key" ON "CurrencyLot"("fundingId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyLot_conversionId_key" ON "CurrencyLot"("conversionId");

-- CreateIndex
CREATE INDEX "CurrencyLot_accountId_remainingAmount_idx" ON "CurrencyLot"("accountId", "remainingAmount");

-- CreateIndex
CREATE INDEX "CurrencyLot_accountId_createdAt_idx" ON "CurrencyLot"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "CurrencyLot_sourceType_idx" ON "CurrencyLot"("sourceType");

-- CreateIndex
CREATE INDEX "CurrencyConversionAllocation_conversionId_idx" ON "CurrencyConversionAllocation"("conversionId");

-- CreateIndex
CREATE INDEX "CurrencyConversionAllocation_sourceLotId_idx" ON "CurrencyConversionAllocation"("sourceLotId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyConversionAllocation_conversionId_sourceLotId_key" ON "CurrencyConversionAllocation"("conversionId", "sourceLotId");

-- CreateIndex
CREATE INDEX "TripExpense_tripSettingsId_idx" ON "TripExpense"("tripSettingsId");

-- CreateIndex
CREATE INDEX "TripExpense_accountId_idx" ON "TripExpense"("accountId");

-- CreateIndex
CREATE INDEX "TripExpense_currencyCode_idx" ON "TripExpense"("currencyCode");

-- CreateIndex
CREATE INDEX "TripExpense_expenseDate_idx" ON "TripExpense"("expenseDate");

-- CreateIndex
CREATE INDEX "TripExpenseAllocation_tripExpenseId_idx" ON "TripExpenseAllocation"("tripExpenseId");

-- CreateIndex
CREATE INDEX "TripExpenseAllocation_sourceLotId_idx" ON "TripExpenseAllocation"("sourceLotId");

-- CreateIndex
CREATE UNIQUE INDEX "TripExpenseAllocation_tripExpenseId_sourceLotId_key" ON "TripExpenseAllocation"("tripExpenseId", "sourceLotId");

-- CreateIndex
CREATE INDEX "Folder_projectId_idx" ON "Folder"("projectId");

-- CreateIndex
CREATE INDEX "Project_type_idx" ON "Project"("type");

-- AddForeignKey
ALTER TABLE "TripSettings" ADD CONSTRAINT "TripSettings_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripCurrencyAccount" ADD CONSTRAINT "TripCurrencyAccount_tripSettingsId_fkey" FOREIGN KEY ("tripSettingsId") REFERENCES "TripSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripFunding" ADD CONSTRAINT "TripFunding_tripSettingsId_fkey" FOREIGN KEY ("tripSettingsId") REFERENCES "TripSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripFunding" ADD CONSTRAINT "TripFunding_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TripCurrencyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyConversion" ADD CONSTRAINT "CurrencyConversion_tripSettingsId_fkey" FOREIGN KEY ("tripSettingsId") REFERENCES "TripSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyConversion" ADD CONSTRAINT "CurrencyConversion_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "TripCurrencyAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyConversion" ADD CONSTRAINT "CurrencyConversion_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "TripCurrencyAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyLot" ADD CONSTRAINT "CurrencyLot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TripCurrencyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyLot" ADD CONSTRAINT "CurrencyLot_fundingId_fkey" FOREIGN KEY ("fundingId") REFERENCES "TripFunding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyLot" ADD CONSTRAINT "CurrencyLot_conversionId_fkey" FOREIGN KEY ("conversionId") REFERENCES "CurrencyConversion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyConversionAllocation" ADD CONSTRAINT "CurrencyConversionAllocation_conversionId_fkey" FOREIGN KEY ("conversionId") REFERENCES "CurrencyConversion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyConversionAllocation" ADD CONSTRAINT "CurrencyConversionAllocation_sourceLotId_fkey" FOREIGN KEY ("sourceLotId") REFERENCES "CurrencyLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripExpense" ADD CONSTRAINT "TripExpense_tripSettingsId_fkey" FOREIGN KEY ("tripSettingsId") REFERENCES "TripSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripExpense" ADD CONSTRAINT "TripExpense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TripCurrencyAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripExpenseAllocation" ADD CONSTRAINT "TripExpenseAllocation_tripExpenseId_fkey" FOREIGN KEY ("tripExpenseId") REFERENCES "TripExpense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripExpenseAllocation" ADD CONSTRAINT "TripExpenseAllocation_sourceLotId_fkey" FOREIGN KEY ("sourceLotId") REFERENCES "CurrencyLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
