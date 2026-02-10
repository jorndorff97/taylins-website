"use client";

interface QuantityStepperProps {
  value: number;
  max: number;
  min?: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, max, min = 0, onChange }: QuantityStepperProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
          aria-label="Decrease quantity"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="h-10 w-16 rounded-lg border border-slate-300 bg-white text-center text-base font-medium text-slate-900 focus:border-hero-accent focus:outline-none focus:ring-2 focus:ring-hero-accent/20"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
          aria-label="Increase quantity"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      <p className="text-xs text-slate-500">
        {max > 0 ? `${max} available` : "Out of stock"}
      </p>
    </div>
  );
}
