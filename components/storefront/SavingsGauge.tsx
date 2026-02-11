"use client";

interface SavingsGaugeProps {
  yourPrice: number;
  stockXPrice: number;
  totalPairs: number;
}

export function SavingsGauge({ yourPrice, stockXPrice, totalPairs }: SavingsGaugeProps) {
  const savingsPerPair = stockXPrice - yourPrice;
  const totalSavings = savingsPerPair * totalPairs;
  const percentage = Math.round((savingsPerPair / stockXPrice) * 100);
  
  // Only show if there's actual savings
  if (savingsPerPair <= 0) return null;
  
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30 p-3 md:p-4">
      {/* Thin progress bar at top */}
      <div className="relative mb-3 h-0.5 overflow-hidden rounded-full bg-slate-200">
        <div 
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Subtle shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>
      
      {/* Compact savings display */}
      <div>
        <p className="text-sm text-slate-500">StockX Price</p>
        <p className="text-lg font-semibold text-slate-700 line-through">
          ${stockXPrice.toLocaleString()}
        </p>
        <p className="mt-1 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
          Save ${totalSavings.toLocaleString()} ({percentage}% off)
        </p>
        {totalPairs > 1 && (
          <p className="mt-0.5 text-xs text-slate-600">
            for {totalPairs} pairs
          </p>
        )}
      </div>
    </div>
  );
}
