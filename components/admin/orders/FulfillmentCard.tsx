"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forwardToSupplier, addTracking } from "@/app/admin/(dashboard)/orders/actions";

const CARRIERS = ["USPS", "UPS", "FedEx", "DHL", "Other"] as const;

const FULFILLMENT_STATE: Record<string, { label: string; variant: "default" | "success" | "warning" | "muted" }> = {
  PENDING: { label: "Unfulfilled", variant: "muted" },
  CONFIRMED: { label: "Unfulfilled", variant: "muted" },
  PAID: { label: "Unfulfilled", variant: "warning" },
  PROCESSING: { label: "Sent to Supplier", variant: "default" },
  SHIPPED: { label: "Shipped", variant: "success" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "muted" },
  REFUNDED: { label: "Refunded", variant: "muted" },
};

interface FulfillmentCardProps {
  orderId: number;
  status: string;
  supplierOrderId: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  fulfilledAt: string | null;
}

export function FulfillmentCard({
  orderId,
  status,
  supplierOrderId,
  trackingNumber,
  trackingCarrier,
  trackingUrl,
  estimatedDelivery,
  fulfilledAt,
}: FulfillmentCardProps) {
  const [showForwardForm, setShowForwardForm] = useState(false);
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const state = FULFILLMENT_STATE[status] ?? { label: status, variant: "muted" as const };

  const canForward = status === "PAID";
  const canAddTracking = status === "PROCESSING" || status === "PAID";
  const hasTracking = !!trackingNumber;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Fulfillment
        </p>
        <Badge variant={state.variant}>{state.label}</Badge>
      </div>

      {/* Supplier info (if forwarded) */}
      {fulfilledAt && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
          <p className="text-xs text-slate-500">
            Sent to supplier on{" "}
            <span className="font-medium text-slate-700">
              {new Date(fulfilledAt).toLocaleDateString()}
            </span>
          </p>
          {supplierOrderId && (
            <p className="mt-1 text-xs text-slate-500">
              Supplier Ref:{" "}
              <span className="font-mono font-medium text-slate-700">{supplierOrderId}</span>
            </p>
          )}
        </div>
      )}

      {/* Tracking info (if shipped) */}
      {hasTracking && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-emerald-700">{trackingCarrier}</p>
              <p className="font-mono text-xs text-emerald-600">{trackingNumber}</p>
            </div>
            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-emerald-700 hover:underline"
              >
                Track
              </a>
            )}
          </div>
          {estimatedDelivery && (
            <p className="mt-2 text-xs text-emerald-600">
              Estimated delivery: {new Date(estimatedDelivery).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Forward to Supplier Form */}
      {canForward && !showForwardForm && !showTrackingForm && (
        <Button
          onClick={() => setShowForwardForm(true)}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          Forward to Supplier
        </Button>
      )}

      {showForwardForm && (
        <form action={forwardToSupplier} className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
          <input type="hidden" name="orderId" value={orderId} />
          <div>
            <label className="text-xs font-medium text-slate-600">
              Supplier Reference ID (optional)
            </label>
            <Input
              name="supplierOrderId"
              placeholder="e.g. SUP-12345"
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" size="sm" className="flex-1">
              Confirm Forward
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForwardForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Add Tracking Form */}
      {canAddTracking && !hasTracking && !showTrackingForm && !showForwardForm && (
        <Button
          onClick={() => setShowTrackingForm(true)}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          Add Tracking
        </Button>
      )}

      {showTrackingForm && (
        <form action={addTracking} className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
          <input type="hidden" name="orderId" value={orderId} />
          <div>
            <label className="text-xs font-medium text-slate-600">Carrier</label>
            <select
              name="trackingCarrier"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">Select carrier...</option>
              {CARRIERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Tracking Number</label>
            <Input
              name="trackingNumber"
              required
              placeholder="Enter tracking number"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">
              Estimated Delivery (optional)
            </label>
            <Input
              type="date"
              name="estimatedDelivery"
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" size="sm" className="flex-1">
              Add Tracking
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTrackingForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
