"use client";

import { useState } from "react";
import { updateSupplierCost } from "@/app/admin/(dashboard)/orders/actions";
import clsx from "clsx";

interface ProfitBreakdownProps {
  orderId: number;
  revenue: number;
  supplierCost: number | null;
  defaultSupplierCost: number | null;
  shippingCost: number | null;
}

export function ProfitBreakdown({
  orderId,
  revenue,
  supplierCost,
  defaultSupplierCost,
  shippingCost,
}: ProfitBreakdownProps) {
  const [editing, setEditing] = useState(false);
  const cost = supplierCost ?? defaultSupplierCost;
  const stripeFee = revenue * 0.029 + 0.3;
  const profit = cost != null ? revenue - cost - (shippingCost ?? 0) - stripeFee : null;
  const margin = profit != null && revenue > 0 ? (profit / revenue) * 100 : null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Profit Breakdown
      </p>
      <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Revenue</span>
          <span className="font-medium text-slate-900">${revenue.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Supplier Cost</span>
          {editing ? (
            <form
              action={async (formData) => {
                await updateSupplierCost(formData);
                setEditing(false);
              }}
              className="flex items-center gap-1"
            >
              <input type="hidden" name="orderId" value={orderId} />
              <input
                type="number"
                name="supplierCost"
                step="0.01"
                defaultValue={cost?.toFixed(2) ?? ""}
                className="w-24 rounded border border-slate-200 px-2 py-1 text-right text-xs"
                autoFocus
              />
              <button
                type="submit"
                className="rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1">
              <span className="font-medium text-red-500">
                {cost != null ? `-$${cost.toFixed(2)}` : "N/A"}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-slate-400 hover:text-slate-600"
                title="Edit supplier cost"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {(shippingCost ?? 0) > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">Shipping</span>
            <span className="font-medium text-red-500">-${(shippingCost ?? 0).toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-slate-500">Stripe Fee (2.9% + 30¢)</span>
          <span className="font-medium text-red-500">-${stripeFee.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-2">
          <span className="font-bold text-slate-900">Net Profit</span>
          {profit != null ? (
            <div className="text-right">
              <span className={clsx("text-base font-bold", profit >= 0 ? "text-emerald-600" : "text-red-500")}>
                {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
              </span>
              {margin != null && (
                <span className={clsx("ml-1 text-xs", profit >= 0 ? "text-emerald-500" : "text-red-400")}>
                  ({margin.toFixed(1)}%)
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400">Set supplier cost to calculate</span>
          )}
        </div>
      </div>
    </div>
  );
}
