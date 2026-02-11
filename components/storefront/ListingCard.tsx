"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
      className="will-animate"
    >
      <Link
        href={`/listing/${listing.id}`}
        className="group block relative"
      >
        {/* Large Rank Number - Zellerfeld Style */}
        {rank != null && (
          <div className="absolute -left-2 -top-3 z-20 pointer-events-none">
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.2, duration: 0.5 }}
              className="text-[120px] sm:text-[140px] font-black leading-none text-slate-900/[0.03] select-none"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {rank}
            </motion.span>
          </div>
        )}

        {/* Product Image Container */}
        <motion.div 
          className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {soldOut && (
            <div className="absolute left-3 top-3 z-10 rounded-full bg-slate-900/90 backdrop-blur-sm px-3 py-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-white">
                Sold Out
              </span>
            </div>
          )}
          
          {primaryImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImage}
                alt={listing.title}
                className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300 text-sm">
              No image
            </div>
          )}
        </motion.div>
        
        {/* Product Info - Clean & Minimal */}
        <div className="mt-4 space-y-2">
          {/* Brand Name - Replaces "By Category" */}
          {listing.brand && (
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {listing.brand}
            </p>
          )}
          
          {/* Product Title */}
          <h3 className="text-base font-semibold text-slate-900 leading-snug group-hover:text-slate-700 transition-colors line-clamp-2">
            {listing.title}
          </h3>
          
          {/* Price & MOQ */}
          <div className="flex items-center gap-2.5 pt-0.5">
            {startingPrice != null && (
              <span className="text-lg font-bold text-slate-900">
                ${startingPrice.toLocaleString()}
                {listing.pricingMode === PricingMode.TIER && "+"}
              </span>
            )}
            <Badge 
              variant="default" 
              className="rounded-full bg-slate-100 text-[9px] font-semibold uppercase tracking-wide text-slate-600 px-2.5 py-0.5"
            >
              MOQ {listing.moq}
            </Badge>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
