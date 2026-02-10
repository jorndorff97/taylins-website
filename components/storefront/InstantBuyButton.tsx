"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface InstantBuyButtonProps {
  listingId: number;
  moq: number;
  totalAvailablePairs: number;
}

export function InstantBuyButton({ listingId, moq, totalAvailablePairs }: InstantBuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInstantBuy = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create order with MOQ quantity
      const response = await fetch("/api/orders/instant-buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity: moq }),
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
        onClick={handleInstantBuy}
        disabled={loading}
        className="w-full bg-hero-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        {loading ? "Creating checkout..." : "Buy Now"}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <p className="text-xs text-slate-500">
        You'll be redirected to secure checkout to complete your purchase.
      </p>
    </div>
  );
}
