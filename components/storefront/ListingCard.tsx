import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { isSoldOut } from "@/lib/inventory";
import { getStartingPricePerPair } from "@/lib/pricing";
import type { Listing, ListingImage, ListingSize, ListingTierPrice } from "@prisma/client";
import { PricingMode } from "@prisma/client";

interface ListingCardProps {
  listing: Listing & {
    images: ListingImage[];
    sizes?: ListingSize[];
    tierPrices?: ListingTierPrice[];
  };
  rank?: number;
}

export function ListingCard({ listing, rank }: ListingCardProps) {
  const primaryImage = listing.images[0]?.url;
  const soldOut = isSoldOut(listing);
  const startingPrice = getStartingPricePerPair({
    listing,
    tiers: listing.tierPrices ?? [],
  });

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block transition-all hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        {rank != null && (
          <span className="absolute left-4 top-4 text-8xl font-bold leading-none text-white/40">
            {rank}
          </span>
        )}
        {soldOut && (
          <span className="absolute left-4 top-4 rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
            Sold Out
          </span>
        )}
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            No image
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1.5 px-1">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
          By {listing.category}
        </p>
        <p className="text-base font-medium text-slate-900">{listing.title}</p>
        <div className="flex items-center gap-3 pt-1">
          <Badge variant="default" className="rounded-md bg-slate-900 text-[9px] uppercase tracking-wide text-white">
            MOQ {listing.moq}
          </Badge>
          {startingPrice != null && (
            <span className="text-lg font-semibold text-slate-900">
              ${startingPrice.toLocaleString()}
              {listing.pricingMode === PricingMode.TIER && "+"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
