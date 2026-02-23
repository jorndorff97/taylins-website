"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface OrderMobileCardProps {
  order: {
    id: number;
    status: string;
    totalPairs: number;
    totalAmount: number;
    createdAt: string;
    user: { email: string; name: string | null };
    listing: { id: number; title: string; images: { url: string }[] };
  };
  statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "muted">;
  fulfillmentLabel: string;
  fulfillmentVariant: "default" | "success" | "warning" | "danger" | "muted";
  profit: number | null;
}

export function OrderMobileCard({
  order,
  statusVariant,
  fulfillmentLabel,
  fulfillmentVariant,
  profit,
}: OrderMobileCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {order.listing.images[0]?.url && (
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">
              <img
                src={order.listing.images[0].url}
                alt=""
                className="h-full w-full object-contain p-0.5"
              />
            </div>
          )}
          <div>
            <span className="text-base font-semibold text-slate-900">#{order.id}</span>
            <p className="mt-0.5 text-xs text-slate-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant[order.status] ?? "default"}>
          {order.status}
        </Badge>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <Link
          href={`/admin/listings/${order.listing.id}/edit`}
          className="block text-sm font-medium text-slate-900 hover:text-slate-700 hover:underline"
        >
          {order.listing.title}
        </Link>
      </div>

      <div className="mt-2">
        <p className="text-xs text-slate-500">
          {order.user.name ?? order.user.email}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm">
        <div>
          <span className="text-xs text-slate-500">Pairs:</span>{" "}
          <span className="font-medium text-slate-900">{order.totalPairs}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500">Revenue:</span>{" "}
          <span className="font-medium text-slate-900">${order.totalAmount.toLocaleString()}</span>
        </div>
        {profit != null && (
          <div>
            <span className="text-xs text-slate-500">Profit:</span>{" "}
            <span className={profit >= 0 ? "font-medium text-emerald-600" : "font-medium text-red-500"}>
              {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <Badge variant={fulfillmentVariant}>{fulfillmentLabel}</Badge>
        <Link
          href={`/admin/orders/${order.id}`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-800"
        >
          View Order
        </Link>
      </div>
    </div>
  );
}
