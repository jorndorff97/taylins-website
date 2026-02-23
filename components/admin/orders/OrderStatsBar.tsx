"use client";

interface OrderStatsBarProps {
  totalOrders: number;
  awaitingFulfillment: number;
  inTransit: number;
  totalRevenue: number;
}

const stats = [
  { key: "totalOrders", label: "Total Orders", format: (v: number) => v.toLocaleString() },
  { key: "awaitingFulfillment", label: "Awaiting Fulfillment", format: (v: number) => v.toLocaleString() },
  { key: "inTransit", label: "In Transit", format: (v: number) => v.toLocaleString() },
  { key: "totalRevenue", label: "Revenue", format: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
] as const;

export function OrderStatsBar({
  totalOrders,
  awaitingFulfillment,
  inTransit,
  totalRevenue,
}: OrderStatsBarProps) {
  const values: Record<string, number> = {
    totalOrders,
    awaitingFulfillment,
    inTransit,
    totalRevenue,
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {stat.label}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {stat.format(values[stat.key])}
          </p>
        </div>
      ))}
    </div>
  );
}
