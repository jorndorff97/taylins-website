import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrderProgressStepper } from "@/components/admin/orders/OrderProgressStepper";
import { OrderItemsTable } from "@/components/admin/orders/OrderItemsTable";
import { ProfitBreakdown } from "@/components/admin/orders/ProfitBreakdown";
import { ShippingAddressCard } from "@/components/admin/orders/ShippingAddressCard";
import { FulfillmentCard } from "@/components/admin/orders/FulfillmentCard";
import { StatusActions } from "@/components/admin/orders/StatusActions";
import { OrderTimeline } from "@/components/admin/orders/OrderTimeline";
import { OrderDetailMessages } from "@/components/admin/orders/OrderDetailMessages";

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
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      items: true,
      messages: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const serializedItems = order.items.map((i) => ({
    ...i,
    pricePerPair: Number(i.pricePerPair),
  }));

  const defaultSupplierCost = order.listing.costPerPair
    ? Number(order.listing.costPerPair) * order.totalPairs
    : null;

  const serializedActivities = order.activities.map((a) => ({
    id: a.id,
    type: a.type,
    description: a.description,
    metadata: a.metadata as Record<string, any> | null,
    createdAt: a.createdAt.toISOString(),
  }));

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
      <main className="flex-1 bg-slate-50/50 px-4 pb-10 pt-6 md:px-6">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Section 1: Progress Stepper */}
          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold text-slate-900">Order #{order.id}</p>
                <p className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <OrderProgressStepper status={order.status} />
            </div>
          </Card>

          {/* Section 2 & 3: Main Content */}
          <div className="grid gap-6 md:grid-cols-5">

            {/* Left Column: Order Details (3/5 width) */}
            <div className="space-y-6 md:col-span-3">

              {/* Product Card */}
              <Card className="p-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  {order.listing.images[0]?.url && (
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">
                      <img
                        src={order.listing.images[0].url}
                        alt={order.listing.title}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Product
                    </p>
                    <Link
                      href={`/admin/listings/${order.listingId}/edit`}
                      className="text-sm font-semibold text-slate-900 hover:text-red-600 transition-colors truncate block"
                    >
                      {order.listing.title}
                    </Link>
                    {order.listing.productSKU && (
                      <p className="text-xs text-slate-400">SKU: {order.listing.productSKU}</p>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Customer
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {order.user.name || "No name provided"}
                    </p>
                    <p className="text-xs text-slate-500">{order.user.email}</p>
                    {order.user.phone && (
                      <p className="text-xs text-slate-500">{order.user.phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Payment
                    </p>
                    {order.paidAt ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-bold uppercase">
                          Paid {new Date(order.paidAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Awaiting payment</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-5">
                <OrderItemsTable
                  items={serializedItems}
                  totalPairs={order.totalPairs}
                  totalAmount={Number(order.totalAmount)}
                  shippingCost={order.shippingCost ? Number(order.shippingCost) : null}
                  shippingLabel={order.shippingLabel}
                />
              </Card>

              {/* Profit Breakdown */}
              <Card className="p-5">
                <ProfitBreakdown
                  orderId={order.id}
                  revenue={Number(order.totalAmount)}
                  supplierCost={order.supplierCost ? Number(order.supplierCost) : null}
                  defaultSupplierCost={defaultSupplierCost}
                  shippingCost={order.shippingCost ? Number(order.shippingCost) : null}
                />
              </Card>

              {/* Shipping Address */}
              <Card className="p-5">
                <ShippingAddressCard
                  address={order.shippingAddress as Record<string, any> | null}
                />
              </Card>

              {/* Buyer Notes */}
              {order.notes && (
                <Card className="p-5 bg-yellow-50/30 border-yellow-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-700 mb-2">
                    Buyer Notes
                  </p>
                  <p className="text-sm text-slate-700 italic leading-relaxed">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                </Card>
              )}
            </div>

            {/* Right Column: Actions + Timeline (2/5 width) */}
            <div className="space-y-6 md:col-span-2">

              {/* Fulfillment Card */}
              <Card className="p-5">
                <FulfillmentCard
                  orderId={order.id}
                  status={order.status}
                  supplierOrderId={order.supplierOrderId}
                  trackingNumber={order.trackingNumber}
                  trackingCarrier={order.trackingCarrier}
                  trackingUrl={order.trackingUrl}
                  estimatedDelivery={order.estimatedDelivery?.toISOString() ?? null}
                  fulfilledAt={order.fulfilledAt?.toISOString() ?? null}
                />
              </Card>

              {/* Status Actions Card */}
              <Card className="p-5">
                <StatusActions orderId={order.id} status={order.status} />
              </Card>

              {/* Activity Timeline */}
              <Card className="p-5">
                <OrderTimeline
                  orderId={order.id}
                  activities={serializedActivities}
                  createdAt={order.createdAt.toISOString()}
                  paidAt={order.paidAt?.toISOString() ?? null}
                />
              </Card>

              {/* Buyer Messages (collapsible) */}
              <Card className="p-5">
                <OrderDetailMessages
                  orderId={order.id}
                  messages={order.messages.map((m) => ({
                    id: m.id,
                    senderType: m.senderType,
                    body: m.body,
                    createdAt: m.createdAt.toISOString(),
                  }))}
                />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
