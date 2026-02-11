"use client";

import { PricingMode } from "@prisma/client";

interface PriceCardProps {
  pricingMode: PricingMode;
  flatPricePerPair: number | null;
  tierPrices: Array<{ minQty: number; pricePerPair: number }>;
  moq: number;
}

export function PriceCard({
  pricingMode,
  flatPricePerPair,
  tierPrices,
  moq,
}: PriceCardProps) {
  // Calculate starting price
  const startingPrice =
    pricingMode === PricingMode.FLAT && flatPricePerPair
      ? Number(flatPricePerPair)
      : tierPrices.length > 0
        ? Number(tierPrices[0].pricePerPair)
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
    </div>
  );
}
