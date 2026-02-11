"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ListingRowActions } from "./ListingRowActions";
import { getTotalPairs } from "@/lib/inventory";
import { ListingStatus, PricingMode } from "@prisma/client";
import type { Listing, ListingImage, ListingSize, ListingTierPrice } from "@prisma/client";

// Serialized version with Decimal converted to number
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

export function ListingMobileCard({ listing }: ListingMobileCardProps) {
  // Cast to compatible type for getTotalPairs (it only uses inventoryMode, totalPairs, and sizes)
  const totalPairs = getTotalPairs(listing as any);
  const primaryImage = listing.images[0]?.url;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header: Image + Title */}
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
              No image
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/admin/listings/${listing.id}/edit`}
            className="block text-sm font-semibold text-slate-900 hover:text-slate-700"
          >
            {listing.title}
          </Link>
          <p className="mt-0.5 text-xs text-slate-500">{listing.category}</p>
        </div>
      </div>

      {/* Key Info: MOQ, Pairs, Status */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="text-xs text-slate-600">
          <span className="font-medium">MOQ:</span> {listing.moq}
        </div>
        <div className="text-xs text-slate-600">
          <span className="font-medium">Pairs:</span> {totalPairs}
        </div>
        <Badge variant="muted" className="text-[10px]">
          {listing.pricingMode === PricingMode.FLAT ? "Flat" : "Tier"}
        </Badge>
        <ListingStatusBadge status={listing.status} />
      </div>

      {/* Actions */}
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
