import { Listing, ListingTierPrice, PricingMode } from "@prisma/client";

export function getApplicableTier(
  tiers: ListingTierPrice[],
  orderQty: number,
): ListingTierPrice | null {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let best: ListingTierPrice | null = null;

  for (const tier of sorted) {
    if (orderQty >= tier.minQty) {
      best = tier;
    }
  }

  return best;
}

export function calculateOrderPrice(options: {
  listing: Listing;
  tiers: ListingTierPrice[];
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
  listing: Listing;
  tiers: ListingTierPrice[];
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

