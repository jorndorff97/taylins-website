import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";

export default async function AccountPage() {
  const buyerId = await getBuyerId();
  if (!buyerId) redirect("/login?redirect=/account");

  let buyer = null;
  let hasError = false;

  try {
    buyer = await prisma.buyer.findUnique({
      where: { id: buyerId },
      include: {
        orders: {
          include: { listing: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    hasError = true;
  }

  if (!buyer && !hasError) {
    redirect("/login");
  }

  if (hasError || !buyer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-8">
          Account
        </h1>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Account Loading</h2>
          <p className="text-slate-600 text-center mb-6 max-w-md">
            We're setting up your account. Please try again in a moment or browse our products.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Account
      </h1>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">Email</p>
            <p className="text-slate-900 font-medium">{buyer.email}</p>
            {buyer.name && (
              <>
                <p className="text-sm text-slate-600 mt-4 mb-1">Name</p>
                <p className="text-slate-900">{buyer.name}</p>
              </>
            )}
            {buyer.phone && (
              <>
                <p className="text-sm text-slate-600 mt-4 mb-1">Phone</p>
                <p className="text-slate-900">{buyer.phone}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-medium text-slate-900">Recent orders</h2>
      {buyer.orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-slate-200 bg-white">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
          <p className="text-slate-600 text-center mb-6 max-w-sm">
            Start shopping by browsing our products. Send an offer or buy instantly to place your first order.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Browse Products
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {buyer.orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/order/${order.id}`}
                className="block rounded-lg border border-slate-200 p-4 transition hover:border-slate-300"
              >
                <span className="font-medium text-slate-900">
                  {order.listing.title}
                </span>
                <span className="ml-2 text-sm text-slate-500">
                  {order.totalPairs} pairs · ${Number(order.totalAmount).toLocaleString()}
                </span>
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {order.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
