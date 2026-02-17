import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { replyToOrder, updateOrderStatus } from "../actions";
import { SenderType } from "@prisma/client";
import { MessageBubble } from "@/components/messaging/MessageBubble";

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
      user: true,
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } }
        }
      },
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
            <Button variant="secondary" size="sm">Back to orders</Button>
          </Link>
        }
      />
      <main className="flex-1 bg-slate-50/50 px-6 pb-10 pt-6">
        <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3">
          {/* Left Column: Order Details */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-5 shadow-sm border-slate-200/60 overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  {order.listing.images[0]?.url && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                      <img src={order.listing.images[0].url} alt={order.listing.title} className="w-full h-full object-contain p-1" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listing</p>
                    <Link
                      href={`/admin/listings/${order.listingId}/edit`}
                      className="text-sm font-semibold text-slate-900 hover:text-red-600 truncate block transition-colors"
                    >
                      {order.listing.title}
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Buyer</p>
                    <p className="font-semibold text-slate-900">{order.user.name || "No name provided"}</p>
                    <p className="text-xs text-slate-500">{order.user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order Status</p>
                    <form action={updateOrderStatus} className="flex items-center gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PAID">PAID</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <Button type="submit" variant="secondary" size="sm" className="h-8 !px-3 text-[10px] uppercase font-bold">
                        Update
                      </Button>
                    </form>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Financials</p>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-500">Total Pairs</span>
                        <span className="text-sm font-bold text-slate-900">{order.totalPairs}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Total Amount</span>
                        <span className="text-sm font-bold text-slate-900">${Number(order.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                    {order.paidAt ? (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-bold uppercase">Paid {new Date(order.paidAt).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <Link href={`/admin/orders/${order.id}/payment`} className="w-full">
                        <Button variant="secondary" size="sm" className="w-full h-9 bg-slate-900 text-white hover:bg-slate-800 border-none">
                          Generate Payment Link
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {order.notes && (
              <Card className="p-5 shadow-sm border-slate-200/60 bg-yellow-50/30 border-yellow-100">
                <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-2">Buyer Notes</p>
                <p className="text-sm text-slate-700 italic leading-relaxed">&ldquo;{order.notes}&rdquo;</p>
              </Card>
            )}
          </div>

          {/* Right Column: Chat Interface */}
          <div className="md:col-span-2 space-y-6">
            <Card className="flex flex-col h-[700px] shadow-sm border-slate-200/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Buyer Communication
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[10px] uppercase font-bold tracking-tight">
                    Order #{order.id}
                  </Badge>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scrollbar-hide">
                {order.messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    body={m.body}
                    createdAt={m.createdAt}
                    isOwnMessage={m.senderType === SenderType.SELLER}
                    senderName={m.senderType === SenderType.SELLER ? "You" : "Buyer"}
                  />
                ))}
              </div>

              {/* Reply Form */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form action={replyToOrder} className="flex flex-col gap-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="relative group">
                    <textarea
                      name="body"
                      required
                      rows={3}
                      placeholder="Type your response to the buyer..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 transition-all resize-none scrollbar-hide"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-400 font-medium">The buyer will receive a notification.</p>
                    <Button type="submit" className="bg-slate-900 text-white rounded-xl px-6 h-10 hover:bg-slate-800 transition-all active:scale-95">
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
