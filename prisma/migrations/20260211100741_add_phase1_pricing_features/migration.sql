-- CreateEnum
CREATE TYPE "TierPricingType" AS ENUM ('FIXED_PRICE', 'PERCENTAGE_OFF');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "basePricePerPair" DECIMAL(65,30),
ADD COLUMN     "costPerPair" DECIMAL(65,30),
ADD COLUMN     "maxOrderQty" INTEGER;

-- AlterTable
ALTER TABLE "ListingTierPrice" ADD COLUMN     "discountPercent" DECIMAL(65,30),
ADD COLUMN     "pricingType" "TierPricingType" NOT NULL DEFAULT 'FIXED_PRICE',
ALTER COLUMN "pricePerPair" DROP NOT NULL;
