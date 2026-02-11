"use client";

import { useState } from "react";
import Link from "next/link";
import type { Listing, ListingSize, ListingTierPrice } from "@prisma/client";
import { InventoryMode } from "@prisma/client";
import { SizeSelector } from "./SizeSelector";
import { QuantityStepper } from "./QuantityStepper";
import { calculateOrderPrice, getApplicableTier } from "@/lib/pricing";
import { PricingMode } from "@prisma/client";

interface ListingActionsProps {
  listing: Listing & {
    sizes: ListingSize[];
    tierPrices: ListingTierPrice[];
  };
}

export function ListingActions({ listing }: ListingActionsProps) {
  const [sizeQuantities, setSizeQuantities] = useState<Record<number, number>>({});
  const [mixedQty, setMixedQty] = useState(0);

  const totalPairs =
    listing.inventoryMode === InventoryMode.SIZE_RUN
      ? Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0)
      : mixedQty;

  const totalAmount =
    totalPairs > 0
      ? calculateOrderPrice({
          listing,
          tiers: listing.tierPrices,
          orderQty: totalPairs,
        })
      : null;

  const moqMet = totalPairs >= listing.moq;

  const handleSizeQuantityChange = (sizeId: number, quantity: number) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [sizeId]: quantity,
    }));
  };

  const handleInstantBuy = async () => {
    if (!moqMet || totalPairs === 0) return;

    try {
      const body: any = { listingId: listing.id };

      if (listing.inventoryMode === InventoryMode.SIZE_RUN) {
        const items = listing.sizes
          .filter((s) => !s.soldOut && sizeQuantities[s.id] > 0)
          .map((s) => ({
            sizeId: s.id,
            sizeLabel: s.sizeLabel,
            quantity: sizeQuantities[s.id],
          }));
        body.items = items;
      } else {
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
      window.location.href = checkoutUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const pricePerPair =
    listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair
      ? Number(listing.flatPricePerPair)
      : totalPairs > 0
        ? (() => {
            const tier = getApplicableTier(listing.tierPrices, totalPairs);
            return tier ? Number(tier.pricePerPair) : null;
          })()
        : null;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Size and Quantity Selection */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          {listing.inventoryMode === InventoryMode.SIZE_RUN ? "Select Size & Quantity" : "Select Quantity"}
        </h2>
        <div>
          {listing.inventoryMode === InventoryMode.SIZE_RUN ? (
            <SizeSelector
              sizes={listing.sizes}
              selectedSizeQuantities={sizeQuantities}
              onQuantityChange={handleSizeQuantityChange}
            />
          ) : (
            <QuantityStepper
              value={mixedQty}
              max={listing.totalPairs ?? 0}
              onChange={setMixedQty}
            />
          )}
        </div>
      </div>

      {/* MOQ Warning */}
      {totalPairs > 0 && !moqMet && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-900">
            Add {listing.moq - totalPairs} more {listing.moq - totalPairs === 1 ? "pair" : "pairs"} to meet minimum order
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {listing.instantBuy && (
          <button
            onClick={handleInstantBuy}
            disabled={!moqMet || totalPairs === 0}
            className="w-full rounded-full bg-slate-900 px-8 py-4 text-base font-medium text-white transition-all hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
          >
            {totalPairs === 0
              ? "Select quantity to buy"
              : !moqMet
                ? "Add more to proceed"
                : totalAmount
                  ? `Buy now - $${totalAmount.toLocaleString()}`
                  : "Buy now"}
          </button>
        )}

        <Link
          href={`/order/request?listingId=${listing.id}`}
          className={`block w-full rounded-full px-8 py-4 text-center text-base font-medium transition-all ${
            listing.instantBuy
              ? "border-2 border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          Request quote
        </Link>

        {listing.instantBuy && (
          <p className="text-center text-xs text-slate-500">
            Have questions? Want to negotiate? Use "Request quote" to discuss with the seller.
          </p>
        )}
      </div>

      {/* Live Price Summary */}
      {totalPairs > 0 && (
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 md:p-5">
          <div className="flex items-baseline justify-between">
            <div>
              {pricePerPair && (
                <p className="text-sm text-slate-600">
                  ${pricePerPair.toLocaleString()} per pair
                </p>
              )}
              <p className="text-2xl font-bold text-slate-900">
                ${totalAmount?.toLocaleString() ?? 0}
              </p>
              <p className="text-sm text-slate-600">
                {totalPairs} {totalPairs === 1 ? "pair" : "pairs"}
              </p>
            </div>
            {listing.stockXPrice && pricePerPair && Number(listing.stockXPrice) > pricePerPair && (
              <div className="text-right">
                <p className="text-xs text-slate-500">vs StockX</p>
                <p className="text-lg font-bold text-emerald-700">
                  Save ${Math.round((Number(listing.stockXPrice) - pricePerPair) * totalPairs).toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">
                  (${Math.round(Number(listing.stockXPrice) - pricePerPair)} per pair)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

