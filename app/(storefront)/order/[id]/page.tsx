import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-config";
import { OrderThread } from "./OrderThread";
import { PaymentButton } from "@/components/storefront/PaymentButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const userId = await getUserId();
  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in required</h1>
        <p className="text-slate-600 mb-8">Please sign in to your account to view this order details.</p>
        <Link href="/login" className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all">
          Sign In
        </Link>
      </div>
    );
  }

  const { id } = await params;
  const { payment } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } }
        }
      },
      items: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || order.userId !== userId) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link href="/messages" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to messages
      </Link>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Order Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 border-slate-200/60 shadow-sm overflow-hidden">
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                {order.listing.images[0]?.url && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-slate-100 mb-4 shadow-sm p-2">
                    <img src={order.listing.images[0].url} alt={order.listing.title} className="w-full h-full object-contain" />
                  </div>
                )}
                <h2 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                  {order.listing.title}
                </h2>
                <Link href={`/listing/${order.listingId}`} className="text-xs font-semibold text-red-600 hover:underline">
                  View Product
                </Link>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Order ID</span>
                  <span className="font-bold text-slate-900">#{order.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Status</span>
                  <Badge variant={order.status === 'CANCELLED' ? 'danger' : 'default'} className="font-bold text-[10px] uppercase">
                    {order.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Quantity</span>
                  <span className="font-bold text-slate-900">{order.totalPairs} pairs</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Total Price</span>
                  <span className="text-lg font-black text-slate-900">${Number(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Section */}
              <div className="pt-6 border-t border-slate-100">
                {order.paidAt ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Paid in full</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">{new Date(order.paidAt).toLocaleDateString()}</p>
                  </div>
                ) : order.stripeCheckoutSessionId ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tight mb-2 text-center">Payment Required</p>
                    <PaymentButton orderId={order.id} />
                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                      Secure checkout powered by Stripe.
                    </p>
                  </div>
                ) : order.status === "PENDING" ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-12 0 9 9 0 0112 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">Processing</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Waiting for seller to send payment link.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          {/* Success/Error Toasts */}
          {(payment === "success" || payment === "cancelled") && (
            <div className={`p-4 rounded-2xl border ${payment === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800 shadow-sm'}`}>
              <div className="flex gap-3">
                {payment === 'success' ? (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">{payment === 'success' ? 'Payment Success' : 'Payment Failed'}</p>
                  <p className="text-[11px] mt-0.5 opacity-90">{payment === 'success' ? 'Your order is being processed. Thank you!' : 'The transaction was cancelled. Please try again or contact support.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chat Interface */}
        <div className="md:col-span-2">
          <OrderThread orderId={order.id} messages={order.messages} />
        </div>
      </div>
    </div>
  );
}
