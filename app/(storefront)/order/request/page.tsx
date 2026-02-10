import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import { OrderRequestForm } from "./OrderRequestForm";
import { isSoldOut } from "@/lib/inventory";

interface RequestPageProps {
  searchParams: Promise<{ listingId?: string }>;
}

export default async function OrderRequestPage({ searchParams }: RequestPageProps) {
  const params = await searchParams;
  const buyerId = await getBuyerId();
  if (!buyerId) {
    redirect(`/login?redirect=${encodeURIComponent(`/order/request?listingId=${params.listingId ?? ""}`)}`);
  }
  const listingId = Number(params.listingId);
  if (!listingId || Number.isNaN(listingId)) {
    redirect("/browse");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: { orderBy: { id: "asc" } },
      tierPrices: { orderBy: { minQty: "asc" } },
    },
  });

  if (!listing) redirect("/browse");
  if (isSoldOut(listing)) redirect(`/listing/${listing.id}`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href={`/listing/${listing.id}`} className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to listing
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        Request order
      </h1>
      <p className="mt-1 text-slate-600">{listing.title}</p>
      <OrderRequestForm listing={listing} />
    </div>
  );
}
