-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "productSKU" TEXT,
ADD COLUMN     "stockXPrice" DECIMAL(65,30),
ADD COLUMN     "stockXPriceUpdatedAt" TIMESTAMP(3);
