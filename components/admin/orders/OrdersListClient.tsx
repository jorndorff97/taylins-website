"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { OrderStatsBar } from "./OrderStatsBar";
import { OrderStatusTabs, type OrderTab } from "./OrderStatusTabs";
import { OrderFilters, type OrderSort } from "./OrderFilters";
import { OrderMobileCard } from "./OrderMobileCard";

interface SerializedOrder {
  id: number;
  status: string;
  totalPairs: number;
  totalAmount: number;
  shippingCost: number | null;
  supplierCost: number | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  createdAt: string;
  paidAt: string | null;
  fulfilledAt: string | null;
  deliveredAt: string | null;
  user: { email: string; name: string | null };
  listing: {
    id: number;
    title: string;
    costPerPair: number | null;
    images: { url: string }[];
  };
  items: { sizeLabel: string | null; quantity: number }[];
}

interface OrdersListClientProps {
  orders: SerializedOrder[];
}

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  PENDING: "warning",
  CONFIRMED: "default",
  PAID: "success",
  PROCESSING: "default",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "muted",
  REFUNDED: "danger",
};

const FULFILLMENT_LABEL: Record<string, string> = {
  PENDING: "Unfulfilled",
  CONFIRMED: "Unfulfilled",
  PAID: "Unfulfilled",
  PROCESSING: "Sent to Supplier",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const FULFILLMENT_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  PENDING: "muted",
  CONFIRMED: "muted",
  PAID: "warning",
  PROCESSING: "default",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "muted",
  REFUNDED: "danger",
};

const TAB_STATUSES: Record<OrderTab, string[]> = {
  all: [],
  awaiting_payment: ["PENDING", "CONFIRMED"],
  awaiting_fulfillment: ["PAID"],
  in_transit: ["PROCESSING", "SHIPPED"],
  delivered: ["DELIVERED"],
  cancelled: ["CANCELLED", "REFUNDED"],
};

function calcProfit(order: SerializedOrder): number | null {
  const cost =
    order.supplierCost ??
    (order.listing.costPerPair != null
      ? order.listing.costPerPair * order.totalPairs
      : null);
  if (cost == null) return null;
  const stripeFee = order.totalAmount * 0.029 + 0.3;
  return order.totalAmount - cost - (order.shippingCost ?? 0) - stripeFee;
}

export function OrdersListClient({ orders }: OrdersListClientProps) {
  const [tab, setTab] = useState<OrderTab>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<OrderSort>("newest");

  const tabCounts = useMemo(() => {
    const counts: Record<OrderTab, number> = {
      all: orders.length,
      awaiting_payment: 0,
      awaiting_fulfillment: 0,
      in_transit: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      for (const [key, statuses] of Object.entries(TAB_STATUSES)) {
        if (statuses.length > 0 && statuses.includes(o.status)) {
          counts[key as OrderTab]++;
        }
      }
    }
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    let result = orders;

    const statuses = TAB_STATUSES[tab];
    if (statuses.length > 0) {
      result = result.filter((o) => statuses.includes(o.status));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          `#${o.id}`.includes(q) ||
          o.user.email.toLowerCase().includes(q) ||
          (o.user.name?.toLowerCase().includes(q) ?? false) ||
          o.listing.title.toLowerCase().includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest":
          return b.totalAmount - a.totalAmount;
        case "lowest":
          return a.totalAmount - b.totalAmount;
      }
    });

    return result;
  }, [orders, tab, search, sort]);

  const stats = useMemo(() => {
    const paidStatuses = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
    return {
      totalOrders: orders.length,
      awaitingFulfillment: orders.filter((o) => o.status === "PAID").length,
      inTransit: orders.filter((o) => o.status === "PROCESSING" || o.status === "SHIPPED").length,
      totalRevenue: orders
        .filter((o) => paidStatuses.includes(o.status))
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
  }, [orders]);

  return (
    <div className="space-y-4">
      <OrderStatsBar {...stats} />
      <OrderStatusTabs activeTab={tab} onTabChange={setTab} counts={tabCounts} />
      <OrderFilters
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Mobile Card Grid */}
      <div className="block space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <Card className="p-6">
            <div className="text-center text-sm text-slate-500">
              No orders match your filters.
            </div>
          </Card>
        ) : (
          filtered.map((order) => (
            <OrderMobileCard
              key={order.id}
              order={order}
              statusVariant={STATUS_VARIANT}
              fulfillmentLabel={FULFILLMENT_LABEL[order.status] ?? "Unknown"}
              fulfillmentVariant={FULFILLMENT_VARIANT[order.status] ?? "muted"}
              profit={calcProfit(order)}
            />
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <THead>
            <TR>
              <TH>Order</TH>
              <TH>Product</TH>
              <TH>Customer</TH>
              <TH>Items</TH>
              <TH>Revenue</TH>
              <TH>Profit</TH>
              <TH>Fulfillment</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.length === 0 ? (
              <TR>
                <TD colSpan={9}>
                  <div className="py-8 text-center text-sm text-slate-500">
                    No orders match your filters.
                  </div>
                </TD>
              </TR>
            ) : (
              filtered.map((order) => {
                const profit = calcProfit(order);
                const sizeBreakdown = order.items
                  .map((i) => `${i.sizeLabel ?? "Mixed"} x${i.quantity}`)
                  .join(", ");
                return (
                  <TR key={order.id}>
                    <TD>
                      <span className="font-medium text-slate-900">#{order.id}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        {order.listing.images[0]?.url && (
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-slate-100 bg-white">
                            <img
                              src={order.listing.images[0].url}
                              alt=""
                              className="h-full w-full object-contain p-0.5"
                            />
                          </div>
                        )}
                        <Link
                          href={`/admin/listings/${order.listing.id}/edit`}
                          className="max-w-[160px] truncate text-slate-700 hover:text-slate-900 hover:underline"
                        >
                          {order.listing.title}
                        </Link>
                      </div>
                    </TD>
                    <TD>
                      <span className="text-slate-700">{order.user.email}</span>
                      {order.user.name && (
                        <span className="block text-xs text-slate-500">{order.user.name}</span>
                      )}
                    </TD>
                    <TD>
                      <span className="font-medium">{order.totalPairs}</span>
                      {sizeBreakdown && (
                        <span className="block max-w-[120px] truncate text-xs text-slate-500" title={sizeBreakdown}>
                          {sizeBreakdown}
                        </span>
                      )}
                    </TD>
                    <TD className="font-medium">${order.totalAmount.toLocaleString()}</TD>
                    <TD>
                      {profit != null ? (
                        <span className={profit >= 0 ? "font-medium text-emerald-600" : "font-medium text-red-500"}>
                          {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </TD>
                    <TD>
                      <Badge variant={FULFILLMENT_VARIANT[order.status] ?? "muted"}>
                        {FULFILLMENT_LABEL[order.status] ?? order.status}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                        {order.status}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-slate-700 hover:text-slate-900"
                      >
                        View
                      </Link>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
