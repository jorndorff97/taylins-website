"use client";

import type { ListingSize } from "@prisma/client";
import { QuantityStepper } from "./QuantityStepper";

interface SizeSelectorProps {
  sizes: ListingSize[];
  selectedSizeQuantities: Record<number, number>;
  onQuantityChange: (sizeId: number, quantity: number) => void;
  moq?: number;
}

export function SizeSelector({
  sizes,
  selectedSizeQuantities,
  onQuantityChange,
  moq = 0,
}: SizeSelectorProps) {
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
                <QuantityStepper
                  value={quantity}
                  max={size.quantity}
                  firstIncrementValue={moq}
                  onChange={(newQty) => onQuantityChange(size.id, newQty)}
                  compact={true}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
