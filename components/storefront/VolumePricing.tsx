"use client";

import type { ListingTierPrice } from "@prisma/client";

interface VolumePricingProps {
  tierPrices: ListingTierPrice[];
  currentQty: number;
  stockXPrice: number | null;
}

export function VolumePricing({ tierPrices, currentQty, stockXPrice }: VolumePricingProps) {
  if (tierPrices.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Volume Pricing</h2>

      {/* Mobile: Cards */}
      <div className="space-y-3 lg:hidden">
        {tierPrices.map((tier) => {
          const isActive = currentQty >= tier.minQty &&
            (tierPrices.indexOf(tier) === tierPrices.length - 1 ||
              currentQty < tierPrices[tierPrices.indexOf(tier) + 1]?.minQty);
          
          const total = Number(tier.pricePerPair) * tier.minQty;
          const savings = stockXPrice
            ? (stockXPrice - Number(tier.pricePerPair)) * tier.minQty
            : null;

          return (
            <div
              key={tier.id}
              className={`rounded-lg border-2 p-4 transition-all ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {tier.minQty}+ pairs
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    ${Number(tier.pricePerPair).toLocaleString()} per pair
                  </p>
                </div>
                {isActive && (
                  <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <p className="text-sm font-medium text-slate-700">
                  Total: ${total.toLocaleString()}
                </p>
                {savings && savings > 0 && (
                  <p className="text-sm font-medium text-emerald-700">
                    Save ${Math.round(savings).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Table */}
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 lg:block">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                Price/Pair
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                Total
              </th>
              {stockXPrice && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Savings
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tierPrices.map((tier) => {
              const isActive = currentQty >= tier.minQty &&
                (tierPrices.indexOf(tier) === tierPrices.length - 1 ||
                  currentQty < tierPrices[tierPrices.indexOf(tier) + 1]?.minQty);
              
              const total = Number(tier.pricePerPair) * tier.minQty;
              const savings = stockXPrice
                ? (stockXPrice - Number(tier.pricePerPair)) * tier.minQty
                : null;

              return (
                <tr
                  key={tier.id}
                  className={isActive ? 'bg-emerald-50' : 'bg-white'}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {tier.minQty}+ pairs
                    {isActive && (
                      <span className="ml-2 text-xs text-emerald-700">← You are here</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    ${Number(tier.pricePerPair).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    ${total.toLocaleString()}
                  </td>
                  {stockXPrice && (
                    <td className="px-4 py-3 text-sm font-medium text-emerald-700">
                      {savings && savings > 0 ? `$${Math.round(savings).toLocaleString()}` : '—'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
