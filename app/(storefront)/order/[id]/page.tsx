import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import { OrderThread } from "./OrderThread";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const buyerId = await getBuyerId();
  if (!buyerId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-slate-600">
          <Link href="/login" className="text-hero-accent hover:underline">
            Sign in
          </Link>{" "}
          to view this order.
        </p>
      </div>
    );
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      listing: true,
      items: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || order.buyerId !== buyerId) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/account" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to account
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        Order #{order.id}
      </h1>
      <p className="mt-1 text-slate-600">
        <Link href={`/listing/${order.listingId}`} className="hover:underline">
          {order.listing.title}
        </Link>
      </p>
      <p className="mt-2 text-sm text-slate-500">
        {order.totalPairs} pairs · ${Number(order.totalAmount).toLocaleString()} ·{" "}
        <span className="rounded-full bg-slate-100 px-2 py-0.5">{order.status}</span>
      </p>

      <OrderThread orderId={order.id} messages={order.messages} />
    </div>
  );
}
