"use client";

import clsx from "clsx";

export type OrderTab =
  | "all"
  | "awaiting_payment"
  | "awaiting_fulfillment"
  | "in_transit"
  | "delivered"
  | "cancelled";

interface OrderStatusTabsProps {
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
  counts: Record<OrderTab, number>;
}

const tabs: { key: OrderTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "awaiting_payment", label: "Awaiting Payment" },
  { key: "awaiting_fulfillment", label: "Awaiting Fulfillment" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export function OrderStatusTabs({
  activeTab,
  onTabChange,
  counts,
}: OrderStatusTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200/60 bg-white p-1 shadow-sm scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={clsx(
            "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors",
            activeTab === tab.key
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100",
          )}
        >
          {tab.label}
          <span
            className={clsx(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              activeTab === tab.key
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-500",
            )}
          >
            {counts[tab.key]}
          </span>
        </button>
      ))}
    </div>
  );
}
