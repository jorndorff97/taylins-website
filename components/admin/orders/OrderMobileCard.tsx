"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Order, Buyer, Listing } from "@prisma/client";

// Serialized version with Decimal converted to number
interface SerializedOrder extends Omit<Order, "totalAmount"> {
  totalAmount: number;
  buyer: Buyer;
  listing: Listing;
}

interface OrderMobileCardProps {
  order: SerializedOrder;
  statusVariant: Record<string, "default" | "success" | "warning" | "muted">;
}

export function OrderMobileCard({ order, statusVariant }: OrderMobileCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header: Order ID + Date */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-base font-semibold text-slate-900">
            #{order.id}
          </span>
          <p className="mt-0.5 text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={statusVariant[order.status] ?? "default"}>
          {order.status}
        </Badge>
      </div>

      {/* Buyer Info */}
      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-xs font-medium text-slate-500">Buyer</p>
        <p className="mt-1 text-sm text-slate-900">{order.buyer.email}</p>
        {order.buyer.name && (
          <p className="text-xs text-slate-500">{order.buyer.name}</p>
        )}
      </div>

      {/* Listing Info */}
      <div className="mt-3">
        <p className="text-xs font-medium text-slate-500">Listing</p>
        <Link
          href={`/admin/listings/${order.listingId}/edit`}
          className="mt-1 block text-sm text-slate-900 hover:text-slate-700 hover:underline"
        >
          {order.listing.title}
        </Link>
      </div>

      {/* Order Details */}
      <div className="mt-3 flex items-center gap-4 text-sm">
        <div>
          <span className="text-xs text-slate-500">Pairs:</span>{" "}
          <span className="font-medium text-slate-900">{order.totalPairs}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500">Total:</span>{" "}
          <span className="font-medium text-slate-900">
            ${order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* View Action */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <Link
          href={`/admin/orders/${order.id}`}
          className="block w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800"
        >
          View Order
        </Link>
      </div>
    </div>
  );
}
