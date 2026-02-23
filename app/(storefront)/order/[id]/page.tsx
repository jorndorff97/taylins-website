import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-config";
import { PaymentButton } from "@/components/storefront/PaymentButton";
import { Card } from "@/components/ui/card";
import { stripe } from "@/lib/stripe";
import { OrderStatus } from "@prisma/client";

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
  let order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } }
        }
      },
      user: true,
    },
  });

  if (!order || order.userId !== userId) notFound();

  // If order has a checkout session but isn't marked as paid, verify with Stripe
  if (order.stripeCheckoutSessionId && order.status !== "PAID" && !order.paidAt) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
      
      if (session.payment_status === "paid") {
        // Update the order in the database
        order = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAID,
            stripePaymentIntentId: session.payment_intent as string,
            paidAt: new Date(),
          },
          include: {
            listing: {
              include: {
                images: { take: 1, orderBy: { sortOrder: "asc" } }
              }
            },
            user: true,
          },
        });
      }
    } catch (error) {
      console.error("Error verifying Stripe session:", error);
    }
  }

  const isPaid = order.status === "PAID" || order.paidAt !== null || (order.stripePaymentIntentId && order.status !== "CANCELLED");
  const isPaymentSuccess = payment === "success";
  const isPaymentCancelled = payment === "cancelled";

  if (isPaymentSuccess || isPaid) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        <Card className="p-8 md:p-12 text-center border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white">
          <div className="mb-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {isPaymentSuccess ? "Payment Successful!" : "Order Confirmed"}
          </h1>
          <p className="text-slate-600 mb-8">
            {isPaymentSuccess 
              ? "Thank you for your purchase. A confirmation email has been sent to your inbox."
              : "Your order has been paid and is being processed."}
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 text-left">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 mb-4">
              {order.listing.images[0]?.url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-1.5 flex-shrink-0">
                  <img src={order.listing.images[0].url} alt={order.listing.title} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{order.listing.title}</h3>
                <p className="text-sm text-slate-500">Order #{order.id}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Quantity</span>
                <span className="font-medium text-slate-900">{order.totalPairs} pairs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Paid</span>
                <span className="font-bold text-lg text-slate-900">${Number(order.totalAmount).toLocaleString()}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Payment Date</span>
                  <span className="font-medium text-slate-900">{new Date(order.paidAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-8">
            <div className="flex items-start gap-3 text-left">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Confirmation email sent</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  We've sent a receipt to <span className="font-medium">{order.user.email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-8">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">What happens next?</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
                <p className="text-sm text-slate-600">Payment confirmed</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
                <p className="text-sm text-slate-600">Seller prepares your order</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
                <p className="text-sm text-slate-600">Shipping details sent to you</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all"
            >
              Continue Shopping
            </Link>
            <Link
              href="/messages"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all"
            >
              View Messages
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isPaymentCancelled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        <Card className="p-8 md:p-12 text-center border-red-100 bg-gradient-to-b from-red-50/50 to-white">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Payment Cancelled</h1>
          <p className="text-slate-600 mb-8">
            Your payment was not completed. No charges have been made to your account.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 text-left">
            <div className="flex items-center gap-4">
              {order.listing.images[0]?.url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-1.5 flex-shrink-0">
                  <img src={order.listing.images[0].url} alt={order.listing.title} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{order.listing.title}</h3>
                <p className="text-sm text-slate-500">{order.totalPairs} pairs · ${Number(order.totalAmount).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {order.stripeCheckoutSessionId && (
              <PaymentButton orderId={order.id} />
            )}
            <Link
              href="/messages"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all"
            >
              Contact Seller
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const hasPaymentLink = !!order.stripeCheckoutSessionId;

  if (hasPaymentLink) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        <Card className="p-8 md:p-12 text-center border-slate-200 bg-white">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-slate-600 mb-8">
            Your offer has been accepted! Click below to securely complete your payment.
          </p>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-8 text-left">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 mb-4">
              {order.listing.images[0]?.url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 p-1.5 flex-shrink-0">
                  <img src={order.listing.images[0].url} alt={order.listing.title} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{order.listing.title}</h3>
                <p className="text-sm text-slate-500">Order #{order.id}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Quantity</span>
                <span className="font-medium text-slate-900">{order.totalPairs} pairs</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-sm">Total Due</span>
                <span className="font-bold text-2xl text-slate-900">${Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <PaymentButton orderId={order.id} />
            <p className="text-xs text-slate-400">
              Secure checkout powered by Stripe. Your payment information is encrypted.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <Link
              href="/messages"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message the seller
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (order.status === "CANCELLED") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        <Card className="p-8 md:p-12 text-center border-red-100 bg-gradient-to-b from-red-50/50 to-white">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Order Cancelled</h1>
          <p className="text-slate-600 mb-8">
            This order has been cancelled and is no longer active.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 text-left">
            <div className="flex items-center gap-4">
              {order.listing.images[0]?.url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-1.5 flex-shrink-0">
                  <img src={order.listing.images[0].url} alt={order.listing.title} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{order.listing.title}</h3>
                <p className="text-sm text-slate-500">{order.totalPairs} pairs</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/listing/${order.listingId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all"
            >
              View Listing
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all"
            >
              Browse Products
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      <Card className="p-8 md:p-12 text-center border-amber-100 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="mb-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Offer Under Review</h1>
        <p className="text-slate-600 mb-8">
          The seller is reviewing your offer. You'll be notified once they respond.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 text-left">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 mb-4">
            {order.listing.images[0]?.url && (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-1.5 flex-shrink-0">
                <img src={order.listing.images[0].url} alt={order.listing.title} className="w-full h-full object-contain" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{order.listing.title}</h3>
              <p className="text-sm text-slate-500">Order #{order.id}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Quantity</span>
              <span className="font-medium text-slate-900">{order.totalPairs} pairs</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Offered Price</span>
              <span className="font-bold text-lg text-slate-900">${Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-8">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">What happens next?</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
              <p className="text-sm text-slate-600">Seller reviews your offer</p>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
              <p className="text-sm text-slate-600">You'll receive a payment link if accepted</p>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
              <p className="text-sm text-slate-600">Complete payment to confirm your order</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/messages"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            View Messages
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </Card>
    </div>
  );
}
