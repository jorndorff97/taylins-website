"use client";

import { useState } from "react";
import { addOrderNote } from "@/app/admin/(dashboard)/orders/actions";
import clsx from "clsx";

interface Activity {
  id: number;
  type: string;
  description: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

interface OrderTimelineProps {
  orderId: number;
  activities: Activity[];
  createdAt: string;
  paidAt: string | null;
}

const ICON_MAP: Record<string, { icon: string; color: string }> = {
  status_change: { icon: "M9 12l2 2 4-4", color: "bg-blue-500" },
  supplier_forwarded: { icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "bg-amber-500" },
  tracking_added: { icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z", color: "bg-emerald-500" },
  note_added: { icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", color: "bg-slate-500" },
  cost_updated: { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-violet-500" },
  payment_received: { icon: "M5 13l4 4L19 7", color: "bg-emerald-500" },
  order_created: { icon: "M12 6v6m0 0v6m0-6h6m-6 0H6", color: "bg-slate-400" },
};

export function OrderTimeline({
  orderId,
  activities,
  createdAt,
  paidAt,
}: OrderTimelineProps) {
  const [showNoteForm, setShowNoteForm] = useState(false);

  const allEntries: Activity[] = [
    {
      id: -1,
      type: "order_created",
      description: "Order created",
      metadata: null,
      createdAt,
    },
    ...(paidAt
      ? [
          {
            id: -2,
            type: "payment_received",
            description: "Payment received via Stripe",
            metadata: null,
            createdAt: paidAt,
          },
        ]
      : []),
    ...activities,
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Activity Timeline
        </p>
        <button
          onClick={() => setShowNoteForm(!showNoteForm)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          + Add Note
        </button>
      </div>

      {showNoteForm && (
        <form
          action={async (formData) => {
            await addOrderNote(formData);
            setShowNoteForm(false);
          }}
          className="flex gap-2"
        >
          <input type="hidden" name="orderId" value={orderId} />
          <input
            type="text"
            name="note"
            required
            placeholder="Add an internal note..."
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            Save
          </button>
        </form>
      )}

      <div className="relative space-y-0">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />
        {allEntries.map((entry, i) => {
          const iconConfig = ICON_MAP[entry.type] ?? ICON_MAP.status_change;
          return (
            <div key={entry.id} className="relative flex gap-3 py-2">
              <div
                className={clsx(
                  "relative z-10 flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full",
                  iconConfig.color,
                )}
              >
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconConfig.icon} />
                </svg>
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm text-slate-700">{entry.description}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
