"use client";

interface QuantityStepperProps {
  value: number;
  max: number;
  maxOrderQty?: number; // New: maximum per order limit
  min?: number;
  firstIncrementValue?: number;
  onChange: (value: number) => void;
  compact?: boolean;
}

export function QuantityStepper({
  value,
  max,
  maxOrderQty,
  min = 0,
  firstIncrementValue,
  onChange,
  compact = false,
}: QuantityStepperProps) {
  // Calculate effective maximum (consider both inventory and order limit)
  const effectiveMax = maxOrderQty ? Math.min(max, maxOrderQty) : max;

  const handleIncrement = () => {
    if (value < effectiveMax) {
      if (firstIncrementValue && value < firstIncrementValue) {
        onChange(Math.min(firstIncrementValue, effectiveMax));
      } else {
        onChange(value + 1);
      }
    }
  };

  const handleDecrement = () => {
    if (value > effectiveMax) {
      onChange(effectiveMax);
      return;
    }

    if (value > min) {
      if (firstIncrementValue && value <= firstIncrementValue && min === 0) {
        onChange(0);
      } else {
        onChange(value - 1);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val === "") {
      onChange(0);
      return;
    }
    const newValue = parseInt(val);
    if (!isNaN(newValue)) {
      // Allow any number to be typed, so validation can show
      onChange(newValue);
    }
  };

  const isBelowMOQ = value > 0 && firstIncrementValue && value < firstIncrementValue;
  const isAboveMax = value > effectiveMax;
  const hasError = isBelowMOQ || isAboveMax;

  const buttonSize = compact ? "h-8 w-8" : "h-10 w-10";
  const inputSize = compact ? "h-8 w-12 text-sm" : "h-10 w-16 text-base";
  const iconSize = compact ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className={compact ? "" : "space-y-2"}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={`flex ${buttonSize} items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white`}
          aria-label="Decrease quantity"
        >
          <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value === 0 && !compact ? "0" : value}
            onChange={handleInputChange}
            className={`${inputSize} rounded-lg border bg-white text-center font-medium transition-all focus:outline-none focus:ring-2 ${
              hasError
                ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 text-slate-900 focus:border-hero-accent focus:ring-hero-accent/20"
            }`}
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= effectiveMax}
          className={`flex ${buttonSize} items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white`}
          aria-label="Increase quantity"
        >
          <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {!compact && (
        <div className="text-xs transition-all">
          {isBelowMOQ && (
            <p className="font-medium text-red-600">Minimum order is {firstIncrementValue} pairs</p>
          )}
          {isAboveMax && (
            <p className="font-medium text-red-600">Only {effectiveMax} available</p>
          )}
          {!hasError && (
            <>
              {maxOrderQty && value >= maxOrderQty ? (
                <p className="text-amber-700">Max {maxOrderQty} per order</p>
              ) : (
                <p className="text-slate-500">
                  {effectiveMax > 0 ? `${effectiveMax} available` : "Out of stock"}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {compact && hasError && (
        <div className="mt-1 text-[10px] font-medium text-red-600">
          {isBelowMOQ ? `Min ${firstIncrementValue}` : `Max ${effectiveMax}`}
        </div>
      )}
    </div>
  );
}
