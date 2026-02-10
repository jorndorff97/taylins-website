import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "muted"> = {
  PENDING: "warning",
  CONFIRMED: "default",
  PAID: "success",
  SHIPPED: "success",
  CANCELLED: "muted",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      buyer: true,
      listing: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminHeader title="Orders" />
      <main className="flex-1 bg-background px-6 pb-10 pt-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <div>
            <h2 className="text-sm font-medium text-slate-700">Order requests</h2>
            <p className="text-xs text-slate-500">
              View and respond to buyer order requests.
            </p>
          </div>

          <Card className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Buyer</TH>
                  <TH>Listing</TH>
                  <TH>Pairs</TH>
                  <TH>Total</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {orders.length === 0 ? (
                  <TR>
                    <TD colSpan={7}>
                      <div className="py-8 text-center text-sm text-slate-500">
                        No orders yet.
                      </div>
                    </TD>
                  </TR>
                ) : (
                  orders.map((order) => (
                    <TR key={order.id}>
                      <TD>
                        <span className="font-medium text-slate-900">#{order.id}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </TD>
                      <TD>
                        <span className="text-slate-700">{order.buyer.email}</span>
                        {order.buyer.name && (
                          <span className="block text-xs text-slate-500">
                            {order.buyer.name}
                          </span>
                        )}
                      </TD>
                      <TD>
                        <Link
                          href={`/admin/listings/${order.listingId}/edit`}
                          className="text-slate-700 hover:text-slate-900 hover:underline"
                        >
                          {order.listing.title}
                        </Link>
                      </TD>
                      <TD>{order.totalPairs}</TD>
                      <TD>${Number(order.totalAmount).toLocaleString()}</TD>
                      <TD>
                        <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                          {order.status}
                        </Badge>
                      </TD>
                      <TD className="text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          View
                        </Link>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </Card>
        </div>
      </main>
    </>
  );
}
