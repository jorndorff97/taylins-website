import { PricingMode } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Helper type that accepts both Decimal and number for price fields
type FlexibleListing = {
  pricingMode?: PricingMode;
  flatPricePerPair?: Decimal | number | null;
};

type FlexibleTierPrice = {
  minQty: number;
  pricePerPair: Decimal | number | null;
};

export function getApplicableTier(
  tiers: FlexibleTierPrice[],
  orderQty: number,
): FlexibleTierPrice | null {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let best: FlexibleTierPrice | null = null;

  for (const tier of sorted) {
    if (orderQty >= tier.minQty) {
      best = tier;
    }
  }

  return best;
}

export function calculateOrderPrice(options: {
  listing: FlexibleListing;
  tiers: FlexibleTierPrice[];
  orderQty: number;
}): number | null {
  const { listing, tiers, orderQty } = options;

  if (orderQty <= 0) return null;

  if (listing.pricingMode === PricingMode.FLAT) {
    if (!listing.flatPricePerPair) return null;
    return orderQty * Number(listing.flatPricePerPair);
  }

  const tier = getApplicableTier(tiers, orderQty);
  if (!tier) return null;

  return orderQty * Number(tier.pricePerPair);
}

/** Minimum price per pair for display (e.g. listing cards). */
export function getStartingPricePerPair(options: {
  listing: FlexibleListing;
  tiers: FlexibleTierPrice[];
}): number | null {
  const { listing, tiers } = options;

  if (listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair != null) {
    return Number(listing.flatPricePerPair);
  }

  if (listing.pricingMode === PricingMode.TIER && tiers.length > 0) {
    const min = tiers.reduce((acc, t) =>
      Math.min(acc, Number(t.pricePerPair)),
      Number(tiers[0].pricePerPair),
    );
    return min;
  }

  return null;
}

/** Calculate total order details including price per pair and total amount */
export function calculateOrderTotal(options: {
  listing: FlexibleListing;
  tiers: FlexibleTierPrice[];
  totalPairs: number;
}): { pricePerPair: number; totalPairs: number; totalAmount: number } {
  const { listing, tiers, totalPairs } = options;

  let pricePerPair: number;

  if (listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair != null) {
    pricePerPair = Number(listing.flatPricePerPair);
  } else if (listing.pricingMode === PricingMode.TIER) {
    const tier = getApplicableTier(tiers, totalPairs);
    if (!tier) {
      throw new Error("No applicable pricing tier found");
    }
    pricePerPair = Number(tier.pricePerPair);
  } else {
    throw new Error("Invalid pricing configuration");
  }

  const totalAmount = pricePerPair * totalPairs;

  return {
    pricePerPair,
    totalPairs,
    totalAmount,
  };
}

