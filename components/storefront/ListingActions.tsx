"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Listing, ListingSize, ListingTierPrice } from "@prisma/client";
import { InventoryMode, PricingMode } from "@prisma/client";
import { SizeSelector } from "./SizeSelector";
import { QuantityStepper } from "./QuantityStepper";
import { SavingsGauge } from "./SavingsGauge";
import { calculateOrderPrice, getApplicableTier } from "@/lib/pricing";
import { useCart } from "@/context/CartContext";

// Serialized tier price with number instead of Decimal
export interface SerializedTierPrice extends Omit<ListingTierPrice, 'pricePerPair'> {
  pricePerPair: number;
}

export interface SerializedShippingOption {
  id: number;
  label: string;
  price: number;
  enabled: boolean;
  sortOrder: number;
}

export interface SerializedImage {
  id: number;
  url: string;
  sortOrder: number;
}

// Serialized listing type with numbers instead of Decimals
export type SerializedListing = Omit<Listing, 'costPerPair' | 'basePricePerPair' | 'flatPricePerPair' | 'stockXPrice'> & {
  costPerPair: number | null;
  basePricePerPair: number | null;
  flatPricePerPair: number | null;
  stockXPrice: number | null;
  images?: SerializedImage[];
  sizes: ListingSize[];
  tierPrices: SerializedTierPrice[];
  shippingOptions?: SerializedShippingOption[];
};

interface ListingActionsProps {
  listing: SerializedListing;
  onQuantityChange?: (qty: number) => void;
  onPriceChange?: (price: number | null) => void;
}

export function ListingActions({ listing, onQuantityChange, onPriceChange }: ListingActionsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [sizeQuantities, setSizeQuantities] = useState<Record<number, number>>({});
  const [mixedQty, setMixedQty] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(() => {
    const enabledOptions = listing.shippingOptions?.filter(o => o.enabled) ?? [];
    return enabledOptions.length > 0 ? enabledOptions[0].id : null;
  });

  const enabledShippingOptions = listing.shippingOptions?.filter(o => o.enabled) ?? [];
  const hasShippingOptions = enabledShippingOptions.length > 0;
  const selectedShipping = enabledShippingOptions.find(o => o.id === selectedShippingId) ?? null;
  const shippingCost = selectedShipping?.price ?? 0;

  const totalPairs =
    listing.inventoryMode === InventoryMode.SIZE_RUN
      ? Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0)
      : mixedQty;

  const productAmount =
    totalPairs > 0
      ? calculateOrderPrice({
          listing,
          tiers: listing.tierPrices,
          orderQty: totalPairs,
        })
      : null;

  const totalAmount = productAmount != null ? productAmount + shippingCost : null;

  const moqMet = totalPairs >= listing.moq;
  const stockMet = listing.inventoryMode === InventoryMode.MIXED_BATCH 
    ? totalPairs <= (listing.totalPairs ?? 0)
    : listing.sizes.every(s => (sizeQuantities[s.id] || 0) <= s.quantity);
  const maxOrderMet = !listing.maxOrderQty || totalPairs <= listing.maxOrderQty;
  const isValidQuantity = moqMet && stockMet && maxOrderMet && totalPairs > 0;

  const handleSizeQuantityChange = (sizeId: number, quantity: number) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [sizeId]: quantity,
    }));
  };

  const handleAddToCart = () => {
    if (!isValidQuantity) return;
    if (hasShippingOptions && !selectedShippingId) return;

    const cartItems =
      listing.inventoryMode === InventoryMode.SIZE_RUN
        ? listing.sizes
            .filter((s) => !s.soldOut && sizeQuantities[s.id] > 0)
            .map((s) => ({
              sizeId: s.id,
              sizeLabel: s.sizeLabel,
              quantity: sizeQuantities[s.id],
            }))
        : [];

    addToCart({
      listingId: listing.id,
      title: listing.title,
      imageUrl: listing.images?.[0]?.url ?? null,
      pricePerPair: pricePerPair ?? 0,
      totalPairs,
      productTotal: productAmount ?? 0,
      inventoryMode: listing.inventoryMode as "SIZE_RUN" | "MIXED_BATCH",
      items: cartItems,
      shippingOption: selectedShipping
        ? { id: selectedShipping.id, label: selectedShipping.label, price: selectedShipping.price }
        : null,
      addedAt: Date.now(),
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const pricePerPair =
    listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair
      ? Number(listing.flatPricePerPair)
      : totalPairs > 0 && isValidQuantity
        ? (() => {
            const tier = getApplicableTier(listing.tierPrices, totalPairs);
            return tier ? Number(tier.pricePerPair) : null;
          })()
        : null;

  // Notify parent of quantity and price changes for desktop sync
  useEffect(() => {
    onQuantityChange?.(totalPairs);
    onPriceChange?.(pricePerPair);
  }, [totalPairs, pricePerPair, onQuantityChange, onPriceChange]);

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
              moq={listing.moq}
            />
          ) : (
            <QuantityStepper
              value={mixedQty}
              max={listing.totalPairs ?? 0}
              maxOrderQty={listing.maxOrderQty ?? undefined}
              firstIncrementValue={listing.moq}
              onChange={setMixedQty}
            />
          )}
        </div>
      </div>

      {/* Shipping Options */}
      {hasShippingOptions && (
        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Shipping Speed</h2>
          <div className="grid gap-2">
            {enabledShippingOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedShippingId(option.id)}
                className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  selectedShippingId === option.id
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                      selectedShippingId === option.id
                        ? "border-slate-900 bg-slate-900"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedShippingId === option.id && (
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{option.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {option.price === 0 ? "Free" : `+$${option.price.toLocaleString()}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* StockX Savings Gauge - Mobile only (desktop shows below image) */}
      {totalPairs > 0 && listing.stockXPrice && pricePerPair && (
        <div className="md:hidden">
          <SavingsGauge
            yourPrice={pricePerPair}
            stockXPrice={Number(listing.stockXPrice)}
            totalPairs={totalPairs}
          />
        </div>
      )}

      {/* MOQ Warning */}
      {totalPairs > 0 && !moqMet && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-900">
            Add {listing.moq - totalPairs} more {listing.moq - totalPairs === 1 ? "pair" : "pairs"} to meet minimum order
          </p>
        </div>
      )}

      {/* Live Price Summary - Desktop only */}
      {totalPairs > 0 && (
        <div className="hidden rounded-xl border-2 border-slate-200 bg-slate-50 p-4 md:block md:p-5">
          <div className="space-y-1">
            {pricePerPair && (
              <p className="text-sm text-slate-600">
                ${pricePerPair.toLocaleString()} per pair
              </p>
            )}
            {hasShippingOptions && shippingCost > 0 && productAmount != null && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Shipping ({selectedShipping?.label})</span>
                <span>+${shippingCost.toLocaleString()}</span>
              </div>
            )}
            <p className="text-2xl font-bold text-slate-900">
              ${totalAmount?.toLocaleString() ?? 0}
            </p>
            <p className="text-sm text-slate-600">
              {totalPairs} {totalPairs === 1 ? "pair" : "pairs"}
              {hasShippingOptions && selectedShipping && ` · ${selectedShipping.label} shipping`}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {listing.instantBuy && (
          <>
            <button
              onClick={handleAddToCart}
              disabled={!isValidQuantity || (hasShippingOptions && !selectedShippingId)}
              className={`w-full rounded-full px-8 py-4 text-base font-medium transition-all ${
                addedToCart
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
              }`}
            >
              {addedToCart
                ? "Added to cart!"
                : totalPairs === 0
                  ? "Select quantity"
                  : !moqMet
                    ? "Minimum order not met"
                    : !stockMet
                      ? "Quantity exceeds stock"
                      : !maxOrderMet
                        ? `Maximum per order is ${listing.maxOrderQty}`
                        : hasShippingOptions && !selectedShippingId
                          ? "Select shipping speed"
                          : totalAmount
                            ? `Add to cart - $${totalAmount.toLocaleString()}`
                            : "Add to cart"}
            </button>
            {totalPairs > 0 && isValidQuantity && (
              <Link
                href="/cart"
                className="block w-full rounded-full border-2 border-slate-300 bg-white px-8 py-4 text-center text-base font-medium text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50"
              >
                View cart & checkout
              </Link>
            )}
          </>
        )}

        <Link
          href={`/listing/${listing.id}/offer`}
          className={`block w-full rounded-full px-8 py-4 text-center text-base font-medium transition-all ${
            listing.instantBuy
              ? "border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          Send an offer
        </Link>

        {listing.instantBuy && (
          <p className="text-center text-xs text-slate-500">
            Have questions? Want to negotiate? Use &quot;Send an offer&quot; to discuss with the seller.
          </p>
        )}
      </div>
    </div>
  );
}

