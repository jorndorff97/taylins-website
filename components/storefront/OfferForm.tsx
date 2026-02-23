"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing, ListingSize, ListingTierPrice } from "@prisma/client";
import { InventoryMode } from "@prisma/client";
import { calculateOrderTotal } from "@/lib/pricing";

interface OfferFormProps {
  listing: Listing & { sizes: ListingSize[]; tierPrices: ListingTierPrice[] };
}

export function OfferForm({ listing }: OfferFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    quantity: listing.moq,
    pricePerPair: "",
    message: "",
    selectedSizes: {} as Record<string, number>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare offer data
      const offerData: any = {
        listingId: listing.id,
        message: formData.message,
      };

      if (listing.inventoryMode === InventoryMode.SIZE_RUN) {
        const sizes = Object.entries(formData.selectedSizes)
          .filter(([_, qty]) => qty > 0)
          .map(([sizeLabel, quantity]) => ({ sizeLabel, quantity }));
        
        offerData.sizes = sizes;
        offerData.quantity = sizes.reduce((sum, s) => sum + s.quantity, 0);
      } else {
        offerData.quantity = formData.quantity;
      }

      if (formData.pricePerPair) {
        offerData.pricePerPair = Number(formData.pricePerPair);
      }

      const res = await fetch("/api/conversations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send offer");
        setLoading(false);
        return;
      }

      // Redirect to conversation
      router.push(`/messages/${data.conversationId}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const totalQuantity = listing.inventoryMode === InventoryMode.SIZE_RUN
    ? Object.values(formData.selectedSizes).reduce((sum, qty) => sum + qty, 0)
    : formData.quantity;

  const buyNowPrice = (() => {
    try {
      if (listing.pricingMode === "FLAT") {
        return Number(listing.flatPricePerPair || listing.basePricePerPair || 0);
      }
      
      // Always use MOQ for a stable reference price
      const calcQty = listing.moq;
      const { pricePerPair } = calculateOrderTotal({
        listing,
        tiers: listing.tierPrices,
        totalPairs: calcQty,
      });
      return pricePerPair;
    } catch (e) {
      return Number(listing.flatPricePerPair || listing.basePricePerPair || 0);
    }
  })();

  const handleQuantityChange = (valStr: string, sizeLabel?: string) => {
    // Strip leading zeros unless it's just "0"
    const cleaned = valStr.replace(/^0+(?=\d)/, "");
    if (cleaned === "") {
      if (sizeLabel) {
        setFormData({
          ...formData,
          selectedSizes: { ...formData.selectedSizes, [sizeLabel]: 0 }
        });
      } else {
        setFormData({ ...formData, quantity: 0 });
      }
      return;
    }

    const val = parseInt(cleaned);
    if (!isNaN(val)) {
      if (sizeLabel) {
        setFormData({
          ...formData,
          selectedSizes: { ...formData.selectedSizes, [sizeLabel]: val }
        });
      } else {
        setFormData({ ...formData, quantity: val });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Quantity Selection */}
      {listing.inventoryMode === InventoryMode.SIZE_RUN ? (
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-3">
            Select Sizes & Quantities
          </label>
          <div className="space-y-4">
            {listing.sizes.map((size) => {
              const qty = formData.selectedSizes[size.sizeLabel] || 0;
              const isBelowMOQ = qty > 0 && listing.moq && qty < listing.moq;
              const isAboveMax = qty > size.quantity;
              const hasError = isBelowMOQ || isAboveMax;

              return (
                <div key={size.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-sm text-slate-700">{size.sizeLabel}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={qty}
                      onChange={(e) => handleQuantityChange(e.target.value, size.sizeLabel)}
                      className={`w-24 rounded-md border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                        hasError
                          ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500/20"
                          : "border-slate-300 text-slate-900 focus:border-hero-accent focus:ring-hero-accent/20"
                      }`}
                      disabled={size.soldOut}
                    />
                    <span className="text-xs text-slate-500">
                      {size.soldOut ? "Sold out" : `${size.quantity} available`}
                    </span>
                  </div>
                  {hasError && (
                    <div className="ml-[76px] text-[10px] font-medium text-red-600">
                      {isBelowMOQ ? `Min order ${listing.moq}` : `Max stock ${size.quantity}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Total: {totalQuantity} pairs (MOQ: {listing.moq})
          </p>
        </div>
      ) : (
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-slate-900 mb-2">
            Quantity (pairs)
          </label>
          {(() => {
            const qty = formData.quantity;
            const isBelowMOQ = qty > 0 && listing.moq && qty < listing.moq;
            const isAboveMax = listing.totalPairs && qty > (listing.totalPairs || 0);
            const hasError = isBelowMOQ || isAboveMax;

            return (
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="quantity"
                  value={qty}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 transition-all focus:outline-none focus:ring-2 ${
                    hasError
                      ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-300 text-slate-900 focus:border-hero-accent focus:ring-hero-accent/20"
                  }`}
                  required
                />
                {hasError && (
                  <div className="text-[10px] font-medium text-red-600">
                    {isBelowMOQ ? `Min order ${listing.moq}` : `Max stock ${listing.totalPairs}`}
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Minimum: {listing.moq} pairs
                  {listing.totalPairs && ` • Available: ${listing.totalPairs} pairs`}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Target Price */}
      <div>
        <label htmlFor="pricePerPair" className="block text-sm font-medium text-slate-900 mb-2">
          Your target price per pair (optional)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-slate-500">$</span>
          <input
            type="number"
            id="pricePerPair"
            step="0.01"
            min="0"
            value={formData.pricePerPair}
            onChange={(e) => setFormData({ ...formData, pricePerPair: e.target.value })}
            className="w-full rounded-md border border-slate-300 pl-7 pr-3 py-2"
            placeholder="e.g., 100.00"
          />
        </div>
        <div className="mt-1.5 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Let the seller know what price you're hoping for
          </p>
          {buyNowPrice && (
            <p className="text-xs font-medium text-slate-600">
              Buy Now: <span className="text-slate-900">${buyNowPrice.toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-900 mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Tell the seller about your needs, timeline, or any questions you have..."
          required
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-full border-2 border-slate-300 px-8 py-3 text-base font-medium text-slate-900 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || totalQuantity < listing.moq}
          className="flex-1 rounded-full bg-slate-900 px-8 py-3 text-base font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Offer"}
        </button>
      </div>

      {totalQuantity < listing.moq && (
        <p className="text-sm text-amber-600 text-center">
          Please select at least {listing.moq} pairs to meet the minimum order quantity
        </p>
      )}
    </form>
  );
}
