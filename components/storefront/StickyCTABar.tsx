"use client";

import Link from "next/link";

interface StickyCTABarProps {
  instantBuy: boolean;
  totalPairs: number;
  totalAmount: number | null;
  moqMet: boolean;
  moq: number;
  listingId: number;
  onBuyNow: () => void;
}

export function StickyCTABar({
  instantBuy,
  totalPairs,
  totalAmount,
  moqMet,
  moq,
  listingId,
  onBuyNow,
}: StickyCTABarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden">
      <div className="mx-auto max-w-7xl px-4 py-3">
        {instantBuy ? (
          <div className="space-y-2">
            <button
              onClick={onBuyNow}
              disabled={!moqMet || totalPairs === 0}
              className="w-full rounded-full bg-slate-900 py-4 text-base font-medium text-white transition-all hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
            >
              {totalPairs === 0
                ? "Select quantity to buy"
                : !moqMet
                  ? `Add ${moq - totalPairs} more to proceed`
                  : totalAmount
                    ? `Buy now - $${totalAmount.toLocaleString()}`
                    : "Buy now"}
            </button>
            <Link
              href={`/order/request?listingId=${listingId}`}
              className="block w-full rounded-full border-2 border-slate-300 bg-white py-4 text-center text-base font-medium text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50"
            >
              Request quote
            </Link>
          </div>
        ) : (
          <Link
            href={`/order/request?listingId=${listingId}`}
            className="block w-full rounded-full bg-slate-900 py-4 text-center text-base font-medium text-white transition-all hover:bg-slate-800"
          >
            Request quote
          </Link>
        )}
      </div>
    </div>
  );
}
