"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing, ListingSize } from "@prisma/client";
import { InventoryMode } from "@prisma/client";

interface OfferFormProps {
  listing: Listing & { sizes: ListingSize[] };
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
          <div className="space-y-2">
            {listing.sizes.map((size) => (
              <div key={size.id} className="flex items-center gap-3">
                <span className="w-16 text-sm text-slate-700">{size.sizeLabel}</span>
                <input
                  type="number"
                  min="0"
                  max={size.quantity}
                  value={formData.selectedSizes[size.sizeLabel] || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      selectedSizes: {
                        ...formData.selectedSizes,
                        [size.sizeLabel]: Number(e.target.value),
                      },
                    })
                  }
                  className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  disabled={size.soldOut}
                />
                <span className="text-xs text-slate-500">
                  {size.soldOut ? "Sold out" : `${size.quantity} available`}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Total: {totalQuantity} pairs (MOQ: {listing.moq})
          </p>
        </div>
      ) : (
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-slate-900 mb-2">
            Quantity (pairs)
          </label>
          <input
            type="number"
            id="quantity"
            min={listing.moq}
            max={listing.totalPairs || undefined}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Minimum: {listing.moq} pairs
            {listing.totalPairs && ` • Available: ${listing.totalPairs} pairs`}
          </p>
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
        <p className="mt-1 text-xs text-slate-500">
          Let the seller know what price you're hoping for
        </p>
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
