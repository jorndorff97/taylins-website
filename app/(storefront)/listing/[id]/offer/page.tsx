import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import { OfferForm } from "@/components/storefront/OfferForm";

interface OfferPageProps {
  params: Promise<{ id: string }>;
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params;
  const buyerId = await getBuyerId();

  if (!buyerId) {
    redirect(`/login?redirect=${encodeURIComponent(`/listing/${id}/offer`)}`);
  }

  const listing = await prisma.listing.findUnique({
    where: { id: Number(id) },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: { orderBy: { id: "asc" } },
    },
  });

  if (!listing) {
    redirect("/browse");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {listing.images[0] && (
            <img
              src={listing.images[0].url}
              alt={listing.title}
              className="h-20 w-20 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{listing.title}</h1>
            <p className="text-sm text-slate-600">
              MOQ: {listing.moq} pairs • ${Number(listing.flatPricePerPair || listing.basePricePerPair || 0).toLocaleString()}/pair
            </p>
          </div>
        </div>
        <p className="text-slate-600">
          Send an offer with your quantity and price expectations. The seller will respond to discuss details and negotiate.
        </p>
      </div>

      <OfferForm listing={listing} />
    </div>
  );
}
