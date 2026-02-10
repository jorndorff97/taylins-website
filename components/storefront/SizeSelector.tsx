"use client";

import type { ListingSize } from "@prisma/client";

interface SizeSelectorProps {
  sizes: ListingSize[];
  selectedSizeQuantities: Record<number, number>;
  onQuantityChange: (sizeId: number, quantity: number) => void;
}

export function SizeSelector({ sizes, selectedSizeQuantities, onQuantityChange }: SizeSelectorProps) {
  const availableSizes = sizes.filter((s) => !s.soldOut && s.quantity > 0);
  
  if (availableSizes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">No sizes available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availableSizes.map((size) => {
        const quantity = selectedSizeQuantities[size.id] || 0;
        const isSelected = quantity > 0;

        return (
          <div
            key={size.id}
            className={`rounded-lg border-2 p-4 transition-all ${
              isSelected
                ? "border-hero-accent bg-hero-accent/5"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-base font-medium text-slate-900">{size.sizeLabel}</p>
                <p className="text-xs text-slate-500">{size.quantity} pairs available</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onQuantityChange(size.id, Math.max(0, quantity - 1))}
                  disabled={quantity === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
                  aria-label="Decrease"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </button>

                <span className="w-8 text-center text-base font-semibold text-slate-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => onQuantityChange(size.id, Math.min(size.quantity, quantity + 1))}
                  disabled={quantity >= size.quantity}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
                  aria-label="Increase"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
