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

  // Calculate progress bar width (how far your price is from StockX)
  const progressPercent = (yourPrice / stockXPrice) * 100;

  return (
    <div className="rounded-xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
      {/* Header with savings badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <h3 className="text-sm font-semibold text-slate-900">
            {savings.percentage}% Below Market Price
          </h3>
        </div>
        <div className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-xs font-bold text-white shadow-md">
          Save {savings.percentage}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Price comparison */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-900">
            Your Price
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {formatPrice(yourPrice)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            StockX Price
          </p>
          <p className="text-lg font-medium text-slate-600 line-through">
            {formatPrice(stockXPrice)}
          </p>
        </div>
      </div>

      {/* Savings amount */}
      <div className="mt-3 rounded-lg bg-white/60 px-3 py-2 text-center">
        <p className="text-sm font-semibold text-emerald-800">
          You save ${savings.amount.toLocaleString()} per pair
        </p>
      </div>
    </div>
  );
}
