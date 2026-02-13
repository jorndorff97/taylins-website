"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { isSoldOut } from "@/lib/inventory";
import { getStartingPricePerPair } from "@/lib/pricing";
import type { Listing, ListingImage, ListingSize, ListingTierPrice } from "@prisma/client";
import { PricingMode } from "@prisma/client";

// Serialized listing type for client components (Decimal fields converted to number)
type SerializedListing = Omit<Listing, 'flatPricePerPair' | 'basePricePerPair' | 'costPerPair' | 'stockXPrice'> & {
  flatPricePerPair: number | null;
  basePricePerPair: number | null;
  costPerPair: number | null;
  stockXPrice: number | null;
};

type SerializedTierPrice = Omit<ListingTierPrice, 'pricePerPair'> & {
  pricePerPair: number;
};

interface ListingCardProps {
  listing: SerializedListing & {
    images: ListingImage[];
    sizes?: ListingSize[];
    tierPrices?: SerializedTierPrice[];
  };
  rank?: number;
  index?: number;
}

export function ListingCard({ listing, rank, index = 0 }: ListingCardProps) {
  const primaryImage = listing.images[0]?.url;
  const soldOut = isSoldOut(listing);
  const startingPrice = getStartingPricePerPair({
    listing,
    tiers: listing.tierPrices ?? [],
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      <Link
        href={`/listing/${listing.id}`}
        className="group block relative"
      >
        {/* Clean Card Container - GOAT Style */}
        <motion.div 
          className="relative aspect-square overflow-hidden bg-white border border-neutral-200"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {/* Sold Out Badge */}
          {soldOut && (
            <div className="absolute left-2 top-2 z-20 bg-black px-2 py-1">
              <span className="text-xs font-medium uppercase tracking-wide text-white">
                Sold Out
              </span>
            </div>
          )}
          
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={listing.title}
              className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400 text-sm">
              No image
            </div>
          )}
        </motion.div>
          
        {/* Product Info */}
        <div className="mt-3 space-y-1">
          {listing.brand && (
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {listing.brand}
            </p>
          )}
          
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">
            {listing.title}
          </h3>
          
          <div className="pt-1">
            {startingPrice != null && (
              <span className="text-base font-semibold text-neutral-900">
                ${startingPrice.toLocaleString()}
                {listing.pricingMode === PricingMode.TIER && "+"}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
