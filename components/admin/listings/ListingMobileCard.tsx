"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ListingRowActions } from "./ListingRowActions";
import { getTotalPairs } from "@/lib/inventory";
import { ListingStatus, PricingMode } from "@prisma/client";
import type { Listing, ListingImage, ListingSize, ListingTierPrice } from "@prisma/client";

interface SerializedListing extends Omit<Listing, "flatPricePerPair" | "basePricePerPair" | "stockXPrice"> {
  flatPricePerPair: number | null;
  basePricePerPair: number | null;
  stockXPrice: number | null;
  images: ListingImage[];
  sizes: ListingSize[];
  tierPrices: (Omit<ListingTierPrice, "pricePerPair" | "discountPercent"> & { 
    pricePerPair: number | null;
    discountPercent: number | null;
  })[];
}

interface ListingMobileCardProps {
  listing: SerializedListing;
}

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getDisplayPrice(listing: SerializedListing): { label: string; price: string } {
  if (listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair) {
    return { label: "/pair", price: formatPrice(listing.flatPricePerPair) };
  }
  
  if (listing.pricingMode === PricingMode.TIER && listing.tierPrices.length > 0) {
    const sortedTiers = [...listing.tierPrices].sort((a, b) => a.minQty - b.minQty);
    const lowestTier = sortedTiers[0];
    if (lowestTier?.pricePerPair) {
      return { label: "from", price: formatPrice(lowestTier.pricePerPair) };
    }
  }
  
  if (listing.basePricePerPair) {
    return { label: "base", price: formatPrice(listing.basePricePerPair) };
  }
  
  return { label: "", price: "—" };
}

export function ListingMobileCard({ listing }: ListingMobileCardProps) {
  const totalPairs = getTotalPairs(listing as any);
  const primaryImage = listing.images[0]?.url;
  const { label: priceLabel, price } = getDisplayPrice(listing);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={listing.title}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
              No image
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/admin/listings/${listing.id}/edit`}
              className="block text-sm font-semibold text-slate-900 hover:text-slate-700"
            >
              {listing.title}
            </Link>
            <ListingStatusBadge status={listing.status} />
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{listing.category}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-base font-bold text-slate-900">{price}</span>
            {priceLabel && <span className="text-xs text-slate-400">{priceLabel}</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span><strong className="text-slate-700">{totalPairs}</strong> pairs</span>
        <span className="text-slate-300">·</span>
        <span>MOQ <strong className="text-slate-700">{listing.moq}</strong></span>
        <span className="text-slate-300">·</span>
        <Badge variant="muted" className="text-[10px]">
          {listing.pricingMode === PricingMode.FLAT ? "Flat" : "Tier"}
        </Badge>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <ListingRowActions listingId={listing.id} status={listing.status} />
      </div>
    </div>
  );
}

function ListingStatusBadge({ status }: { status: ListingStatus }) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>;
    case "SOLD_OUT":
      return <Badge variant="danger">Sold out</Badge>;
    case "ARCHIVED":
      return <Badge variant="muted">Archived</Badge>;
    case "DRAFT":
    default:
      return <Badge variant="default">Draft</Badge>;
  }
}
