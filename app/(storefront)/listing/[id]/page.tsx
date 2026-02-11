import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { isSoldOut } from "@/lib/inventory";
import { InventoryMode, PricingMode } from "@prisma/client";
import { ListingActions } from "@/components/storefront/ListingActions";
import { ImageGallery } from "@/components/storefront/ImageGallery";
import { PriceCard } from "@/components/storefront/PriceCard";
import { VolumePricing } from "@/components/storefront/VolumePricing";

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

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
        {/* Back button */}
        <Link 
          href="/browse" 
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 md:mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Main content - Single column until 1024px, then 2-column */}
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-12 lg:space-y-0">
          {/* Left column: Images */}
          <div>
            <ImageGallery images={listing.images} title={listing.title} />
          </div>

          {/* Right column: Product info */}
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-2">
              {soldOut && (
                <Badge variant="danger" className="text-xs uppercase tracking-wide">
                  Sold Out
                </Badge>
              )}
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl lg:text-4xl">
                {listing.title}
              </h1>
            </div>

            {/* Price Card with integrated StockX */}
            <PriceCard
              listingId={listing.id}
              pricingMode={listing.pricingMode}
              flatPricePerPair={listing.flatPricePerPair ? Number(listing.flatPricePerPair) : null}
              tierPrices={listing.tierPrices.map(t => ({
                minQty: t.minQty,
                pricePerPair: Number(t.pricePerPair)
              }))}
              moq={listing.moq}
              productSKU={listing.productSKU}
            />

            {/* Stock indicator */}
            {listing.inventoryMode === InventoryMode.SIZE_RUN ? (
              <p className="text-sm text-slate-600">
                {listing.sizes.filter(s => !s.soldOut).length} sizes available
              </p>
            ) : listing.totalPairs != null && (
              <p className="text-sm text-slate-600">
                {listing.totalPairs} pairs available
              </p>
            )}

            {/* Size/Quantity selection and actions */}
            {!soldOut && <ListingActions listing={listing} />}

            {/* Volume Pricing */}
            {listing.pricingMode === PricingMode.TIER && listing.tierPrices.length > 0 && (
              <VolumePricing
                tierPrices={listing.tierPrices}
                currentQty={0}
                stockXPrice={listing.stockXPrice ? Number(listing.stockXPrice) : null}
              />
            )}

            {/* Additional Info */}
            {(listing.stockXLink || listing.discordLink || listing.instagramLink) && (
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h2 className="text-sm font-semibold text-slate-900">Links</h2>
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
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h2 className="text-sm font-semibold text-slate-900">Details</h2>
                <p className="text-sm leading-relaxed text-slate-600">{listing.sellerNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
