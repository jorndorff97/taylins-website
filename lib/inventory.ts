import { InventoryMode, Listing, ListingSize } from "@prisma/client";

export function getTotalPairs(
  listing: Listing & { sizes?: ListingSize[] },
): number {
  if (listing.inventoryMode === InventoryMode.MIXED_BATCH) {
    return listing.totalPairs ?? 0;
  }

  const sizes = listing.sizes ?? [];
  return sizes
    .filter((size) => !size.soldOut)
    .reduce((sum, size) => sum + size.quantity, 0);
}

export function isSoldOut(
  listing: Listing & { sizes?: ListingSize[] },
): boolean {
  if (listing.inventoryMode === InventoryMode.MIXED_BATCH) {
    return (listing.totalPairs ?? 0) === 0;
  }

  const sizes = listing.sizes ?? [];
  return sizes.every((size) => size.soldOut || size.quantity === 0);
}

