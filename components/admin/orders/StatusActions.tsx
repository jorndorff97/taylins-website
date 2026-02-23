"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  updateOrderStatus,
  markDelivered,
} from "@/app/admin/(dashboard)/orders/actions";

interface StatusActionsProps {
  orderId: number;
  status: string;
}

export function StatusActions({ orderId, status }: StatusActionsProps) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Actions
      </p>

      <div className="space-y-2">
        {status === "PENDING" && (
          <>
            <form action={updateOrderStatus}>
              <input type="hidden" name="orderId" value={orderId} />
              <input type="hidden" name="status" value="CONFIRMED" />
              <Button type="submit" variant="secondary" size="sm" className="w-full">
                Confirm Order
              </Button>
            </form>
            <form action={updateOrderStatus}>
              <input type="hidden" name="orderId" value={orderId} />
              <input type="hidden" name="status" value="CANCELLED" />
              <Button type="submit" variant="ghost" size="sm" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600">
                Cancel Order
              </Button>
            </form>
          </>
        )}

        {status === "CONFIRMED" && (
          <Link href={`/admin/orders/${orderId}/payment`} className="block">
            <Button variant="secondary" size="sm" className="w-full">
              Generate Payment Link
            </Button>
          </Link>
        )}

        {status === "SHIPPED" && (
          <form action={markDelivered}>
            <input type="hidden" name="orderId" value={orderId} />
            <Button type="submit" variant="secondary" size="sm" className="w-full">
              Mark Delivered
            </Button>
          </form>
        )}

        {status === "DELIVERED" && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Order Complete
          </div>
        )}

        {/* Manual status override (collapsed) */}
        {!["CANCELLED", "REFUNDED", "DELIVERED"].includes(status) && (
          <details className="rounded-lg border border-slate-100">
            <summary className="cursor-pointer px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600">
              Manual Override
            </summary>
            <form action={updateOrderStatus} className="flex items-center gap-2 px-3 pb-3">
              <input type="hidden" name="orderId" value={orderId} />
              <select
                name="status"
                defaultValue={status}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900/5"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PAID">PAID</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
              <Button type="submit" variant="ghost" size="sm" className="!px-2 text-[10px]">
                Update
              </Button>
            </form>
          </details>
        )}
      </div>
    </div>
  );
}
