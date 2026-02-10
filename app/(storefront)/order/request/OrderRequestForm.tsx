"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing, ListingSize, ListingTierPrice } from "@prisma/client";
import { InventoryMode, PricingMode } from "@prisma/client";
import { getApplicableTier } from "@/lib/pricing";
import { calculateOrderPrice } from "@/lib/pricing";

interface OrderRequestFormProps {
  listing: Listing & {
    sizes: ListingSize[];
    tierPrices: ListingTierPrice[];
  };
}

export function OrderRequestForm({ listing }: OrderRequestFormProps) {
  const router = useRouter();
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
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totalPairs < listing.moq || !totalAmount) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set("listingId", String(listing.id));
    formData.set("totalPairs", String(totalPairs));
    formData.set("totalAmount", String(totalAmount));
    formData.set("notes", notes);

    if (listing.inventoryMode === InventoryMode.SIZE_RUN) {
      const items: { sizeLabel: string; quantity: number; pricePerPair: number }[] = [];
      for (const size of listing.sizes) {
        const qty = quantities[size.id] ?? 0;
        if (qty > 0) {
          const tier = getApplicableTier(listing.tierPrices, totalPairs);
          const pricePerPair =
            listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair != null
              ? Number(listing.flatPricePerPair)
              : tier
                ? Number(tier.pricePerPair)
                : 0;
          items.push({ sizeLabel: size.sizeLabel, quantity: qty, pricePerPair });
        }
      }
      formData.set("items", JSON.stringify(items));
    } else {
      const tier = getApplicableTier(listing.tierPrices, totalPairs);
      const pricePerPair =
        listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair != null
          ? Number(listing.flatPricePerPair)
          : tier
            ? Number(tier.pricePerPair)
            : 0;
      formData.set("items", JSON.stringify([{ sizeLabel: null, quantity: totalPairs, pricePerPair }]));
    }

    const res = await fetch("/api/order/request", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.orderId) {
      router.push(`/order/${data.orderId}`);
    } else {
      setSubmitting(false);
      alert(data.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {listing.inventoryMode === InventoryMode.SIZE_RUN ? (
        <div>
          <h2 className="text-sm font-medium text-slate-800">Quantity by size</h2>
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
                    className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
                  />
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-800">Total pairs</label>
          <p className="mt-1 text-xs text-slate-500">MOQ: {listing.moq} pairs</p>
          <input
            type="number"
            min={0}
            max={listing.totalPairs ?? 0}
            value={mixedQty}
            onChange={(e) => setMixedQty(Number(e.target.value) || 0)}
            className="mt-2 w-32 rounded border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-800">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {totalPairs > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            Total: {totalPairs} pairs
            {totalAmount != null && (
              <> · ${totalAmount.toLocaleString()}</>
            )}
          </p>
          {!moqMet && (
            <p className="mt-1 text-sm text-amber-600">
              Minimum order quantity is {listing.moq} pairs.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!moqMet || totalPairs === 0 || submitting}
        className="rounded-lg bg-hero-accent px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}
