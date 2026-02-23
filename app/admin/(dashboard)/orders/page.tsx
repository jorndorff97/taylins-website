import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrdersListClient } from "@/components/admin/orders/OrdersListClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders: any[] = [];

  try {
    orders = await prisma.order.findMany({
      include: {
        user: { select: { email: true, name: true } },
        listing: {
          select: {
            id: true,
            title: true,
            costPerPair: true,
            images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
          },
        },
        items: { select: { sizeLabel: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  const serializedOrders = orders.map((order) => ({
    id: order.id,
    status: order.status,
    totalPairs: order.totalPairs,
    totalAmount: Number(order.totalAmount),
    shippingCost: order.shippingCost ? Number(order.shippingCost) : null,
    supplierCost: order.supplierCost ? Number(order.supplierCost) : null,
    trackingNumber: order.trackingNumber,
    trackingCarrier: order.trackingCarrier,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
    fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    user: order.user,
    listing: {
      id: order.listing.id,
      title: order.listing.title,
      costPerPair: order.listing.costPerPair ? Number(order.listing.costPerPair) : null,
      images: order.listing.images,
    },
    items: order.items,
  }));

  return (
    <>
      <AdminHeader title="Orders" />
      <main className="flex-1 bg-background px-4 pb-10 pt-6 md:px-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <div>
            <h2 className="text-sm font-medium text-slate-700">Order Management</h2>
            <p className="text-xs text-slate-500">
              Track orders, fulfillment, and profit across all listings.
            </p>
          </div>
          <OrdersListClient orders={serializedOrders} />
        </div>
      </main>
    </>
  );
}
