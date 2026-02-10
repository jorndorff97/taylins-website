"use client";

import { useState } from "react";
import Link from "next/link";
import type { Listing, ListingSize, ListingTierPrice } from "@prisma/client";
import { InventoryMode } from "@prisma/client";
import { QuantitySelector } from "@/components/storefront/QuantitySelector";
import { InstantBuyButton } from "@/components/storefront/InstantBuyButton";

interface ListingActionsProps {
  listing: Listing & {
    sizes: ListingSize[];
    tierPrices: ListingTierPrice[];
  };
}

export function ListingActions({ listing }: ListingActionsProps) {
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

  return (
    <>
      {/* Quantity Selector */}
      <div className="mt-6">
        <QuantitySelector listing={listing} onQuantityChange={handleQuantityChange} />
      </div>

      {/* Dynamic Total Price Display */}
      {totalPairs > 0 && totalAmount != null && (
        <div className="mt-4">
          <p className="text-lg font-semibold text-slate-900">
            Total: ${totalAmount.toLocaleString()} ({totalPairs} pairs)
          </p>
        </div>
      )}

      {/* MOQ Warning */}
      {totalPairs > 0 && !moqMet && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-700">
            Add {listing.moq - totalPairs} more pairs to meet minimum order quantity.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 space-y-4">
        {listing.instantBuy && (
          <div>
            <InstantBuyButton
              listing={listing}
              quantities={quantities}
              totalPairs={totalPairs}
              totalAmount={totalAmount}
              moqMet={moqMet}
            />
          </div>
        )}
        <div>
          <Link
            href={`/order/request?listingId=${listing.id}`}
            className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition ${
              listing.instantBuy
                ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                : "bg-hero-accent text-white hover:opacity-90"
            }`}
          >
            Request quote
          </Link>
          <p className="mt-2 text-xs text-slate-500">
            {listing.instantBuy
              ? "Have questions? Want to negotiate? Submit a quote request to discuss with the seller."
              : "You'll be redirected to submit your order request. The seller will follow up."}
          </p>
        </div>
      </div>
    </>
  );
}
