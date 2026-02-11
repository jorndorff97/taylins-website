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
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-lg">
      {/* Gauge bar at top */}
      <div className="relative mb-6 h-3 overflow-hidden rounded-full bg-slate-200">
        <div 
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-md transition-all duration-700 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
        {/* Percentage marker */}
        <div 
          className="absolute -top-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-600 shadow-lg transition-all duration-700"
          style={{ left: `calc(${Math.min(percentage, 100)}% - 10px)` }}
        />
      </div>
      
      {/* Hero savings amount */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">YOU SAVE</p>
        <p className="mt-2 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-6xl font-black text-transparent transition-all duration-500 md:text-7xl">
          ${totalSavings.toLocaleString()}
        </p>
        <p className="mt-3 text-base font-semibold text-slate-700">
          {percentage}% below StockX market price
        </p>
      </div>
      
      {/* Subtle price breakdown */}
      <div className="mt-5 flex items-center justify-between border-t border-emerald-200 pt-4 text-sm">
        <div>
          <p className="text-xs text-slate-500">Your Price</p>
          <p className="font-bold text-slate-900">${yourPrice.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Quantity</p>
          <p className="font-bold text-slate-900">{totalPairs} {totalPairs === 1 ? 'pair' : 'pairs'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">StockX Price</p>
          <p className="font-medium text-slate-600 line-through">${stockXPrice.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Per-pair savings */}
      <div className="mt-3 text-center">
        <p className="text-xs text-emerald-800">
          Save ${savingsPerPair.toLocaleString()} per pair
        </p>
      </div>
    </div>
  );
}
