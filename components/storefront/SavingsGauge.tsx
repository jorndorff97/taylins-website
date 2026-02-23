"use client";

interface SavingsGaugeProps {
  yourPrice: number;
  stockXPrice: number;
  totalPairs: number;
}

export function SavingsGauge({ yourPrice, stockXPrice, totalPairs }: SavingsGaugeProps) {
  const savingsPerPair = Math.round((stockXPrice - yourPrice) * 100) / 100;
  const totalSavings = Math.round(savingsPerPair * totalPairs * 100) / 100;
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
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-slate-500">StockX Price</p>
          <p className="text-sm font-semibold text-slate-400 line-through">
            ${stockXPrice.toLocaleString()}
          </p>
        </div>
        <p className="mt-1 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
          Save ${savingsPerPair.toLocaleString()} per pair
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
            {percentage}% savings
          </p>
          {totalPairs > 1 && (
            <p className="text-xs text-slate-600">
              Total savings: ${totalSavings.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
