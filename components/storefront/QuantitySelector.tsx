"use client";

import { useState, useEffect } from "react";
import type { Listing, ListingSize, ListingTierPrice } from "@prisma/client";
import { InventoryMode, PricingMode } from "@prisma/client";
import { getApplicableTier, calculateOrderPrice } from "@/lib/pricing";

interface QuantitySelectorProps {
  listing: Listing & {
    sizes: ListingSize[];
    tierPrices: ListingTierPrice[];
  };
  onQuantityChange: (quantities: Record<number, number> | null, totalPairs: number, totalAmount: number | null) => void;
}

export function QuantitySelector({ listing, onQuantityChange }: QuantitySelectorProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>(
    listing.inventoryMode === InventoryMode.SIZE_RUN
      ? Object.fromEntries(
          listing.sizes
            .filter((s) => !s.soldOut && s.quantity > 0)
            .map((s) => [s.id, 0]),
        )
      : {},
  );
  const [mixedQty, setMixedQty] = useState(0);

  const totalPairs =
    listing.inventoryMode === InventoryMode.SIZE_RUN
      ? Object.values(quantities).reduce((a, b) => a + b, 0)
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

  // Notify parent of changes
  useEffect(() => {
    onQuantityChange(
      listing.inventoryMode === InventoryMode.SIZE_RUN ? quantities : null,
      totalPairs,
      totalAmount
    );
  }, [quantities, mixedQty, totalPairs, totalAmount, onQuantityChange, listing.inventoryMode]);

  return (
    <div className="space-y-4">
      {listing.inventoryMode === InventoryMode.SIZE_RUN ? (
        <div>
          <h3 className="text-sm font-medium text-slate-800">Select quantity by size</h3>
          <p className="mt-1 text-xs text-slate-500">MOQ: {listing.moq} pairs</p>
          <div className="mt-3 flex flex-wrap gap-4">
            {listing.sizes
              .filter((s) => !s.soldOut && s.quantity > 0)
              .map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <label className="text-sm text-slate-700">{s.sizeLabel}</label>
                  <input
                    type="number"
                    min={0}
                    max={s.quantity}
                    value={quantities[s.id] ?? 0}
                    onChange={(e) =>
                      setQuantities((prev) => ({ ...prev, [s.id]: Number(e.target.value) || 0 }))
                    }
                    className="w-20 rounded border border-slate-200 px-2 py-1 text-sm focus:border-hero-accent focus:outline-none focus:ring-1 focus:ring-hero-accent"
                  />
                  <span className="text-xs text-slate-400">/{s.quantity}</span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-800">Total pairs</label>
          <p className="mt-1 text-xs text-slate-500">
            MOQ: {listing.moq} pairs | Available: {listing.totalPairs ?? 0} pairs
          </p>
          <input
            type="number"
            min={0}
            max={listing.totalPairs ?? 0}
            value={mixedQty}
            onChange={(e) => setMixedQty(Number(e.target.value) || 0)}
            className="mt-2 w-32 rounded border border-slate-200 px-3 py-2 text-sm focus:border-hero-accent focus:outline-none focus:ring-1 focus:ring-hero-accent"
          />
        </div>
      )}

      {totalPairs > 0 && (
        <div className={`rounded-lg border p-4 ${moqMet ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <p className="text-sm font-medium text-slate-900">
            Total: {totalPairs} pairs
            {totalAmount != null && (
              <> · ${totalAmount.toLocaleString()}</>
            )}
          </p>
          {!moqMet && (
            <p className="mt-1 text-sm text-amber-700">
              Minimum order quantity is {listing.moq} pairs. Add {listing.moq - totalPairs} more.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
