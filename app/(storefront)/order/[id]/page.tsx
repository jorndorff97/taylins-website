import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import { OrderThread } from "./OrderThread";
import { PaymentButton } from "@/components/storefront/PaymentButton";

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const buyerId = await getBuyerId();
  if (!buyerId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-slate-600">
          <Link href="/login" className="text-hero-accent hover:underline">
            Sign in
          </Link>{" "}
          to view this order.
        </p>
      </div>
    );
  }

  const { id } = await params;
  const { payment } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      listing: true,
      items: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || order.buyerId !== buyerId) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/account" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to account
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        Order #{order.id}
      </h1>
      <p className="mt-1 text-slate-600">
        <Link href={`/listing/${order.listingId}`} className="hover:underline">
          {order.listing.title}
        </Link>
      </p>
      <p className="mt-2 text-sm text-slate-500">
        {order.totalPairs} pairs · ${Number(order.totalAmount).toLocaleString()} ·{" "}
        <span className="rounded-full bg-slate-100 px-2 py-0.5">{order.status}</span>
      </p>

      {/* Payment status messages */}
      {payment === "success" && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">
            ✓ Payment successful! Your order is being processed.
          </p>
        </div>
      )}
      {payment === "cancelled" && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Payment was cancelled. You can try again below.
          </p>
        </div>
      )}

      {/* Payment button (only show if not paid yet AND checkout session exists) */}
      {!order.paidAt && order.stripeCheckoutSessionId && (
        <div className="mt-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
            <p className="mt-2 text-sm text-slate-600">
              Complete your payment to process this order.
            </p>
            <div className="mt-4">
              <PaymentButton orderId={order.id} />
            </div>
          </div>
        </div>
      )}
      
      {/* Show waiting for admin confirmation */}
      {!order.paidAt && !order.stripeCheckoutSessionId && order.status === "PENDING" && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Waiting for admin to confirm your order and send payment link...
          </p>
        </div>
      )}

      {/* Show paid status */}
      {order.paidAt && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">
            ✓ Paid on {new Date(order.paidAt).toLocaleDateString()}
          </p>
        </div>
      )}

      <OrderThread orderId={order.id} messages={order.messages} />
    </div>
  );
}
