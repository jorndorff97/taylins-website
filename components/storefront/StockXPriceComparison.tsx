"use client";

import { useEffect, useState } from "react";
import { calculateSavings, formatPrice } from "@/lib/stockx";

interface StockXPriceComparisonProps {
  listingId: number;
  yourPrice: number;
}

export function StockXPriceComparison({ listingId, yourPrice }: StockXPriceComparisonProps) {
  const [stockXPrice, setStockXPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/stockx-price?listingId=${listingId}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || "Failed to fetch");
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('StockX price data:', data);
        setStockXPrice(data.price);
        setLoading(false);
      })
      .catch((err) => {
        console.error('StockX price error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [listingId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-slate-200"></div>
          <div className="mt-2 h-6 w-20 rounded bg-slate-200"></div>
        </div>
      </div>
    );
  }

  // Show error in development/console
  if (error) {
    console.warn('StockX price comparison unavailable:', error);
    return null; // Don't show anything to users
  }

  if (!stockXPrice) {
    return null; // Don't show anything if price unavailable
  }

  const savings = calculateSavings(stockXPrice, yourPrice);

  // Only show if there's actually a discount
  if (savings.amount <= 0) return null;

  return (
    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-900">
            Market Price (StockX)
          </p>
          <p className="mt-1 text-lg font-medium text-slate-600 line-through">
            {formatPrice(stockXPrice)}
          </p>
        </div>
        <div className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
          Save {savings.percentage}%
        </div>
      </div>

      <div className="mt-4 border-t border-emerald-200 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-900">
          Your Price
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-700">
          {formatPrice(yourPrice)}
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          You save ${savings.amount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
