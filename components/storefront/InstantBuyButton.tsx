"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Listing, ListingSize, ListingTierPrice } from "@prisma/client";
import { InventoryMode } from "@prisma/client";

interface InstantBuyButtonProps {
  listing: Listing & {
    sizes: ListingSize[];
    tierPrices: ListingTierPrice[];
  };
  quantities: Record<number, number> | null;
  totalPairs: number;
  totalAmount: number | null;
  moqMet: boolean;
}

export function InstantBuyButton({
  listing,
  quantities,
  totalPairs,
  totalAmount,
  moqMet,
}: InstantBuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!moqMet || totalPairs === 0) {
      setError("Please select quantities that meet the minimum order requirement.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body: any = { listingId: listing.id };

      if (listing.inventoryMode === InventoryMode.SIZE_RUN && quantities) {
        // Build items array for SIZE_RUN
        const items = listing.sizes
          .filter((s) => !s.soldOut && quantities[s.id] > 0)
          .map((s) => ({
            sizeId: s.id,
            sizeLabel: s.sizeLabel,
            quantity: quantities[s.id],
          }));
        body.items = items;
      } else {
        // MIXED_BATCH - just send quantity
        body.quantity = totalPairs;
      }

      const response = await fetch("/api/orders/instant-buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const { checkoutUrl } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePurchase}
        disabled={!moqMet || totalPairs === 0 || loading}
        className="w-full bg-hero-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Buy Now"}
      </Button>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <p className="text-xs text-slate-500">
        {!moqMet && totalPairs > 0
          ? `Select ${listing.moq - totalPairs} more pairs to proceed`
          : totalPairs === 0
            ? "Select quantity above to proceed"
            : "Click to proceed to secure checkout"}
      </p>
    </div>
  );
}
