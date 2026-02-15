import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";

export default async function OrdersPage() {
  const buyerId = await getBuyerId();
  if (!buyerId) redirect("/login?redirect=/orders");

  const buyer = await prisma.buyer.findUnique({
    where: { id: buyerId },
    include: {
      orders: {
        include: {
          listing: {
            include: {
              images: { take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!buyer) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

      {buyer.orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No orders yet</h2>
          <p className="text-slate-600 text-center mb-6 max-w-md">
            Start shopping by browsing our products. Send an offer to negotiate with sellers or buy instantly.
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
        <div className="space-y-4">
          {buyer.orders.map((order) => {
            const statusColors = {
              PENDING: "bg-yellow-100 text-yellow-800",
              CONFIRMED: "bg-blue-100 text-blue-800",
              PAID: "bg-green-100 text-green-800",
              SHIPPED: "bg-purple-100 text-purple-800",
              CANCELLED: "bg-red-100 text-red-800",
            };

            return (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="block rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {order.listing.images[0] && (
                      <img
                        src={order.listing.images[0].url}
                        alt={order.listing.title}
                        className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {order.listing.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {order.totalPairs} pairs · ${Number(order.totalAmount).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Ordered {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
