import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { isSoldOut, getTotalPairs } from "@/lib/inventory";
import { getStartingPricePerPair } from "@/lib/pricing";
import { InventoryMode, PricingMode } from "@prisma/client";
import { InstantBuyButton } from "@/components/storefront/InstantBuyButton";

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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link href="/browse" className="mb-6 inline-block text-sm text-slate-600 hover:text-slate-900">
        ← Back to browse
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
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
            <div className="flex gap-2 overflow-x-auto">
              {listing.images.slice(1, 5).map((img) => (
                <div
                  key={img.id}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">MOQ {listing.moq}</Badge>
            {soldOut && <Badge variant="danger">Sold Out</Badge>}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {listing.title}
          </h1>
          <p className="mt-1 text-slate-600">By {listing.category}</p>

          <div className="mt-6">
            <h2 className="text-sm font-medium text-slate-800">Pricing</h2>
            {listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair != null ? (
              <p className="mt-1 text-lg font-medium">
                ${Number(listing.flatPricePerPair).toLocaleString()} per pair
              </p>
            ) : (
              <div className="mt-2 space-y-1">
                {listing.tierPrices.map((t) => (
                  <p key={t.id} className="text-sm text-slate-700">
                    {t.minQty}+ pairs: ${Number(t.pricePerPair).toLocaleString()} per pair
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Size run */}
          {listing.inventoryMode === InventoryMode.SIZE_RUN && listing.sizes.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-slate-800">Size run</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {listing.sizes.map((s) => (
                  <span
                    key={s.id}
                    className={`rounded-lg border px-3 py-1.5 text-sm ${s.soldOut ? "border-slate-200 bg-slate-50 text-slate-400 line-through" : "border-slate-300 bg-white text-slate-700"}`}
                  >
                    {s.sizeLabel} × {s.quantity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contextual links */}
          {(listing.stockXLink || listing.discordLink || listing.instagramLink) && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-slate-800">Links</h2>
              <div className="mt-2 flex flex-wrap gap-3">
                {listing.stockXLink && (
                  <a
                    href={listing.stockXLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-hero-accent hover:underline"
                  >
                    StockX
                  </a>
                )}
                {listing.discordLink && (
                  <a
                    href={listing.discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-hero-accent hover:underline"
                  >
                    Discord
                  </a>
                )}
                {listing.instagramLink && (
                  <a
                    href={listing.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-hero-accent hover:underline"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {listing.sellerNotes && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-slate-800">Seller notes</h2>
              <p className="mt-1 text-sm text-slate-600">{listing.sellerNotes}</p>
            </div>
          )}

          {/* Order action - instant buy and/or request mode */}
          {!soldOut && (
            <div className="mt-8 space-y-4">
              {listing.instantBuy && (
                <div>
                  <InstantBuyButton listing={listing} />
                </div>
              )}
              <div>
                <Link
                  href={`/order/request?listingId=${listing.id}`}
                  className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition ${
                    listing.instantBuy 
                      ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" 
                      : "bg-hero-accent text-white hover:opacity-90"
                  }`}
                >
                  Request quote
                </Link>
                <p className="mt-2 text-xs text-slate-500">
                  {listing.instantBuy 
                    ? "Have questions? Want to negotiate? Submit a quote request to discuss with the seller."
                    : "You'll be redirected to submit your order request. The seller will follow up."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
