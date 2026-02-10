import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { isSoldOut } from "@/lib/inventory";
import { getStartingPricePerPair } from "@/lib/pricing";
import { InventoryMode, PricingMode } from "@prisma/client";
import { ListingActions } from "@/components/storefront/ListingActions";
import { StockXPriceComparison } from "@/components/storefront/StockXPriceComparison";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id: Number(id) },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: { orderBy: { id: "asc" } },
      tierPrices: { orderBy: { minQty: "asc" } },
    },
  });

  if (!listing) notFound();

  const soldOut = isSoldOut(listing);
  const startingPrice = getStartingPricePerPair({
    listing,
    tiers: listing.tierPrices,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/browse" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Images - Left Column */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
            {listing.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.images[0].url}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                No image
              </div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {listing.images.slice(1, 5).map((img) => (
                <div
                  key={img.id}
                  className="aspect-square overflow-hidden rounded-xl bg-slate-100 transition-all hover:opacity-75"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details - Right Column */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            {soldOut && (
              <Badge variant="danger" className="text-xs uppercase tracking-wide">
                Sold Out
              </Badge>
            )}
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {listing.title}
            </h1>
            <p className="text-sm uppercase tracking-wide text-slate-500">By {listing.category}</p>
          </div>

          {/* Pricing */}
          <div className="border-b border-slate-200 pb-6">
            {listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair != null ? (
              <p className="text-xl font-medium text-slate-900">
                ${Number(listing.flatPricePerPair).toLocaleString()} per pair
              </p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-700">Tiered pricing:</p>
                {listing.tierPrices.map((t) => (
                  <p key={t.id} className="text-sm text-slate-600">
                    {t.minQty}+ pairs: ${Number(t.pricePerPair).toLocaleString()} per pair
                  </p>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              Minimum order: {listing.moq} pairs
            </p>
          </div>

          {/* StockX Price Comparison */}
          {listing.productSKU && startingPrice && (
            <div className="border-b border-slate-200 pb-6">
              <StockXPriceComparison
                listingId={listing.id}
                yourPrice={Number(startingPrice)}
              />
            </div>
          )}

          {/* Additional Info */}
          {(listing.stockXLink || listing.discordLink || listing.instagramLink) && (
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h2 className="text-sm font-medium text-slate-900">Links</h2>
              <div className="flex flex-wrap gap-3">
                {listing.stockXLink && (
                  <a
                    href={listing.stockXLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-hero-accent underline-offset-4 hover:underline"
                  >
                    StockX
                  </a>
                )}
                {listing.discordLink && (
                  <a
                    href={listing.discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-hero-accent underline-offset-4 hover:underline"
                  >
                    Discord
                  </a>
                )}
                {listing.instagramLink && (
                  <a
                    href={listing.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-hero-accent underline-offset-4 hover:underline"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {listing.sellerNotes && (
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h2 className="text-sm font-medium text-slate-900">Details</h2>
              <p className="text-sm leading-relaxed text-slate-600">{listing.sellerNotes}</p>
            </div>
          )}

          {/* Quantity selection and action buttons */}
          {!soldOut && <ListingActions listing={listing} />}
        </div>
      </div>
    </div>
  );
}
