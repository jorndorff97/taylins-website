"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart, type CartItem, type CartShippingOption } from "@/context/CartContext";

interface ShippingOption {
  id: number;
  label: string;
  price: number;
}

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartTotal, updateShippingOption } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptionsMap, setShippingOptionsMap] = useState<Record<number, ShippingOption[]>>({});
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Get listing IDs as a stable string for dependency
  const listingIdsKey = cart.map((item) => item.listingId).sort().join(",");

  // Fetch shipping options for all listings in cart
  useEffect(() => {
    if (!listingIdsKey) return;

    const fetchShippingOptions = async () => {
      setLoadingShipping(true);
      try {
        const res = await fetch(`/api/listings/shipping-options?ids=${listingIdsKey}`);
        if (res.ok) {
          const data = await res.json();
          setShippingOptionsMap(data.shippingOptions || {});
        }
      } catch (err) {
        console.error("Failed to fetch shipping options:", err);
      } finally {
        setLoadingShipping(false);
      }
    };

    fetchShippingOptions();
  }, [listingIdsKey]); // Re-fetch when listing IDs change

  // Check if all items with shipping options have one selected
  const missingShipping = cart.some((item) => {
    const options = shippingOptionsMap[item.listingId] || [];
    return options.length > 0 && !item.shippingOption;
  });

  const canCheckout = cart.length > 0 && !missingShipping && !loadingShipping;

  const handleCheckout = async () => {
    if (!canCheckout) return;
    setIsCheckingOut(true);
    setError(null);

    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Checkout failed");
      }

      const { checkoutUrl } = await response.json();
      clearCart();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mb-8 text-slate-600">Browse our listings to find wholesale deals.</p>
        <Link
          href="/browse"
          className="inline-flex rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <h1 className="mb-8 text-2xl font-bold text-slate-900 md:text-3xl">Your Cart</h1>

      <div className="space-y-4 md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
        {/* Cart Items */}
        <div className="space-y-4 md:col-span-2">
          {cart.map((item) => (
            <CartItemCard
              key={item.listingId}
              item={item}
              shippingOptions={shippingOptionsMap[item.listingId] || []}
              onRemove={() => removeFromCart(item.listingId)}
              onShippingChange={(opt) => updateShippingOption(item.listingId, opt)}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Summary</h2>

            <div className="space-y-3 border-b border-slate-100 pb-4">
              {cart.map((item) => (
                <div key={item.listingId} className="flex justify-between text-sm">
                  <span className="truncate pr-4 text-slate-600">{item.title}</span>
                  <span className="shrink-0 font-medium text-slate-900">
                    ${item.productTotal.toLocaleString()}
                  </span>
                </div>
              ))}

              {cart.some((item) => item.shippingOption && item.shippingOption.price > 0) && (
                <div className="space-y-1 border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Shipping</p>
                  {cart.map(
                    (item) =>
                      item.shippingOption && (
                        <div key={`ship-${item.listingId}`} className="flex justify-between text-sm">
                          <span className="text-slate-600">{item.shippingOption.label}</span>
                          <span className="font-medium text-slate-900">
                            {item.shippingOption.price === 0
                              ? "Free"
                              : `$${item.shippingOption.price.toLocaleString()}`}
                          </span>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-4">
              <span className="text-base font-semibold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-slate-900">${cartTotal.toLocaleString()}</span>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={!canCheckout || isCheckingOut}
              className="mt-5 w-full rounded-full bg-slate-900 px-6 py-4 text-base font-medium text-white transition-all hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : loadingShipping ? (
                "Loading..."
              ) : missingShipping ? (
                "Select shipping options"
              ) : (
                `Checkout - $${cartTotal.toLocaleString()}`
              )}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Secure payment via Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemCardProps {
  item: CartItem;
  shippingOptions: ShippingOption[];
  onRemove: () => void;
  onShippingChange: (option: CartShippingOption) => void;
}

function CartItemCard({ item, shippingOptions, onRemove, onShippingChange }: CartItemCardProps) {
  const hasShippingOptions = shippingOptions.length > 0;
  const needsShippingSelection = hasShippingOptions && !item.shippingOption;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        {/* Image */}
        <Link href={`/listing/${item.listingId}`} className="shrink-0">
          {item.imageUrl ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-100">
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="96px" />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100">
              <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <Link href={`/listing/${item.listingId}`} className="block">
              <h3 className="truncate text-sm font-semibold text-slate-900 hover:text-slate-700">
                {item.title}
              </h3>
            </Link>
            <p className="mt-0.5 text-sm text-slate-600">
              {item.totalPairs} {item.totalPairs === 1 ? "pair" : "pairs"} @ ${item.pricePerPair.toLocaleString()}/pair
            </p>
            {item.items.length > 0 && (
              <p className="mt-0.5 text-xs text-slate-500">
                Sizes: {item.items.map((i) => `${i.sizeLabel} (x${i.quantity})`).join(", ")}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-base font-bold text-slate-900">
              ${(item.productTotal + (item.shippingOption?.price ?? 0)).toLocaleString()}
            </span>
            <button
              onClick={onRemove}
              className="text-xs font-medium text-slate-500 transition-colors hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Options */}
      {hasShippingOptions && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-medium text-slate-700">
            Shipping Speed {needsShippingSelection && <span className="text-red-500">*</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {shippingOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onShippingChange({ id: opt.id, label: opt.label, price: opt.price })}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  item.shippingOption?.id === opt.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {opt.label}
                <span className="ml-1 text-[10px] opacity-80">
                  {opt.price === 0 ? "(Free)" : `(+$${opt.price})`}
                </span>
              </button>
            ))}
          </div>
          {needsShippingSelection && (
            <p className="mt-2 text-xs text-red-500">Please select a shipping option</p>
          )}
        </div>
      )}
    </div>
  );
}
