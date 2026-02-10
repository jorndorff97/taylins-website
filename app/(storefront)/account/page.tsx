import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";

export default async function AccountPage() {
  const buyerId = await getBuyerId();
  if (!buyerId) redirect("/login?redirect=/account");

  const buyer = await prisma.buyer.findUnique({
    where: { id: buyerId },
    include: {
      orders: {
        include: { listing: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!buyer) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Account
      </h1>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-600">{buyer.email}</p>
        {buyer.name && (
          <p className="mt-1 text-sm text-slate-700">{buyer.name}</p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-medium text-slate-900">Recent orders</h2>
      {buyer.orders.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No orders yet.</p>
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
