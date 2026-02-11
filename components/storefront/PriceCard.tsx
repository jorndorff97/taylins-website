"use client";

import { useEffect, useState } from "react";
import { PricingMode } from "@prisma/client";
import { formatPrice } from "@/lib/stockx";

interface PriceCardProps {
  listingId: number;
  pricingMode: PricingMode;
  flatPricePerPair: number | null;
  tierPrices: Array<{ minQty: number; pricePerPair: number }>;
  moq: number;
  productSKU: string | null;
}

export function PriceCard({
  listingId,
  pricingMode,
  flatPricePerPair,
  tierPrices,
  moq,
  productSKU,
}: PriceCardProps) {
  const [stockXPrice, setStockXPrice] = useState<number | null>(null);
  const [loadingStockX, setLoadingStockX] = useState(!!productSKU);

  // Fetch StockX price if SKU exists
  useEffect(() => {
    if (!productSKU) return;

    fetch(`/api/stockx-price?listingId=${listingId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.price) setStockXPrice(data.price);
      })
      .catch(() => {})
      .finally(() => setLoadingStockX(false));
  }, [listingId, productSKU]);

  // Calculate starting price
  const startingPrice =
    pricingMode === PricingMode.FLAT && flatPricePerPair
      ? Number(flatPricePerPair)
      : tierPrices.length > 0
        ? Number(tierPrices[0].pricePerPair)
        : null;

  // Calculate savings
  const savings =
    stockXPrice && startingPrice && stockXPrice > startingPrice
      ? {
          amount: stockXPrice - startingPrice,
          percentage: Math.round(((stockXPrice - startingPrice) / stockXPrice) * 100),
        }
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      {/* Price */}
      {pricingMode === PricingMode.FLAT && startingPrice ? (
        <p className="text-2xl font-bold text-slate-900 md:text-3xl">
          ${startingPrice.toLocaleString()} <span className="text-base font-normal text-slate-600">per pair</span>
        </p>
      ) : tierPrices.length > 0 ? (
        <div>
          <p className="text-sm font-medium text-slate-600">Starting at</p>
          <p className="text-2xl font-bold text-slate-900 md:text-3xl">
            ${Number(tierPrices[0].pricePerPair).toLocaleString()}{" "}
            <span className="text-base font-normal text-slate-600">per pair</span>
          </p>
        </div>
      ) : null}

      {/* MOQ */}
      <p className="mt-2 text-sm text-slate-500">
        Minimum order: <span className="font-medium text-slate-700">{moq} pairs</span>
      </p>

      {/* StockX Comparison - Subtle */}
      {productSKU && (
        <>
          <div className="my-3 border-t border-slate-200" />
          {loadingStockX ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              Loading market price...
            </div>
          ) : stockXPrice && savings ? (
            <div className="text-sm text-slate-600">
              <span className="text-slate-500">StockX:</span>{" "}
              <span className="font-medium line-through">{formatPrice(stockXPrice)}</span>
              {" | "}
              <span className="font-semibold text-emerald-700">
                Save ${savings.amount} ({savings.percentage}% off)
              </span>
            </div>
          ) : stockXPrice ? (
            <p className="text-sm text-slate-600">
              <span className="text-slate-500">StockX:</span>{" "}
              <span className="font-medium">{formatPrice(stockXPrice)}</span>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
