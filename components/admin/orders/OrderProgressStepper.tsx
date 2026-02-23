"use client";

import clsx from "clsx";

const STEPS = [
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PAID", label: "Paid" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PAID: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
};

interface OrderProgressStepperProps {
  status: string;
}

export function OrderProgressStepper({ status }: OrderProgressStepperProps) {
  const isCancelled = status === "CANCELLED" || status === "REFUNDED";
  const currentIndex = STATUS_ORDER[status] ?? -1;

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-red-700">{status}</p>
          <p className="text-xs text-red-500">This order has been {status.toLowerCase()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isCompleted && "bg-emerald-500 text-white",
                  isCurrent && "bg-slate-900 text-white ring-4 ring-slate-900/10",
                  !isCompleted && !isCurrent && "bg-slate-100 text-slate-400",
                )}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={clsx(
                  "mt-1.5 whitespace-nowrap text-[10px] font-medium",
                  isCurrent ? "text-slate-900" : isCompleted ? "text-emerald-600" : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={clsx(
                  "mx-1 h-0.5 w-6 flex-shrink-0 sm:w-10",
                  i < currentIndex ? "bg-emerald-500" : "bg-slate-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
