"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "./QuantitySelector";
import type { Listing, ListingSize, ListingTierPrice } from "@prisma/client";
import { InventoryMode } from "@prisma/client";

interface InstantBuyButtonProps {
  listing: Listing & {
    sizes: ListingSize[];
    tierPrices: ListingTierPrice[];
  };
}

export function InstantBuyButton({ listing }: InstantBuyButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number> | null>(null);
  const [totalPairs, setTotalPairs] = useState(0);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  const moqMet = totalPairs >= listing.moq;

  const handleQuantityChange = (
    newQuantities: Record<number, number> | null,
    newTotalPairs: number,
    newTotalAmount: number | null
  ) => {
    setQuantities(newQuantities);
    setTotalPairs(newTotalPairs);
    setTotalAmount(newTotalAmount);
  };

  const handlePurchase = async () => {
    if (!moqMet || totalPairs === 0) return;
    
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
    <>
      <div className="space-y-2">
        <Button
          onClick={() => setShowModal(true)}
          className="w-full bg-hero-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Buy Now
        </Button>
        <p className="text-xs text-slate-500">
          Select quantity and proceed to secure checkout.
        </p>
      </div>

      {/* Quantity Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Select Quantity</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <QuantitySelector listing={listing} onQuantityChange={handleQuantityChange} />

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setShowModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={!moqMet || totalPairs === 0 || loading}
                className="flex-1 bg-hero-accent text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
