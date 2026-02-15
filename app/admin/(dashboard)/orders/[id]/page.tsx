import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { replyToOrder, updateOrderStatus } from "../actions";
import { SenderType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: true,
      listing: true,
      items: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  return (
    <>
      <AdminHeader
        title={`Order #${order.id}`}
        actions={
          <Link href="/admin/orders">
            <Button variant="secondary">Back to orders</Button>
          </Link>
        }
      />
      <main className="flex-1 bg-background px-6 pb-10 pt-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Buyer</p>
                <p className="font-medium text-slate-900">{order.buyer.email}</p>
                {order.buyer.name && (
                  <p className="text-sm text-slate-600">{order.buyer.name}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Listing</p>
                <Link
                  href={`/admin/listings/${order.listingId}/edit`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {order.listing.title}
                </Link>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Total</p>
                <p className="font-medium text-slate-900">
                  {order.totalPairs} pairs · ${Number(order.totalAmount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Payment Status</p>
                {order.paidAt ? (
                  <p className="mt-1 text-sm text-emerald-600">
                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                  </p>
                ) : (
                  <Link href={`/admin/orders/${order.id}/payment`} className="mt-1 inline-block">
                    <Button variant="secondary" className="!py-1 text-xs">
                      Send payment link
                    </Button>
                  </Link>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Status</p>
                <form action={updateOrderStatus} className="mt-1 flex items-center gap-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="rounded border border-slate-200 px-2 py-1 text-sm"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PAID">PAID</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <Button type="submit" variant="secondary" className="!py-1 text-xs">
                    Update
                  </Button>
                </form>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-medium uppercase text-slate-500">Buyer notes</p>
                <p className="mt-1 text-sm text-slate-700">{order.notes}</p>
              </div>
            )}
          </Card>

          {order.items.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-slate-800">Order items</h3>
              <ul className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-sm text-slate-700"
                  >
                    <span>
                      {item.sizeLabel ?? "Mixed"} × {item.quantity}
                    </span>
                    <span>${Number(item.pricePerPair).toLocaleString()} each</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-800">Messages</h3>
            <div className="mt-4 space-y-3">
              {order.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg border p-4 ${
                    m.senderType === SenderType.SELLER
                      ? "ml-8 border-slate-200 bg-slate-50"
                      : "mr-8 border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-xs text-slate-500">
                    {m.senderType === SenderType.BUYER ? "Buyer" : "You"}
                    {" · "}
                    {new Date(m.createdAt).toLocaleString()}
                    {m.invoiceSentAt && (
                      <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">
                        Invoice sent
                      </span>
                    )}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                    {m.body}
                  </p>
                </div>
              ))}
            </div>
            <form action={replyToOrder} className="mt-6">
              <input type="hidden" name="orderId" value={order.id} />
              <textarea
                name="body"
                required
                rows={4}
                placeholder="Reply to buyer..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <Button type="submit" className="mt-2">
                Send reply
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}
