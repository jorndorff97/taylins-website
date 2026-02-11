"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { isSoldOut } from "@/lib/inventory";
import { getStartingPricePerPair } from "@/lib/pricing";
import { MagneticHover } from "@/components/effects/MagneticHover";
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
    <MagneticHover strength={0.05}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.08,
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className="will-animate relative overflow-visible"
      >
        <Link
          href={`/listing/${listing.id}`}
          className="group block relative overflow-visible"
        >
          {/* Zellerfeld-style rank number - massive and subtle, positioned behind card */}
          {rank != null && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 z-0 pointer-events-none">
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.08 + 0.2, duration: 0.5 }}
                className="text-[180px] sm:text-[200px] lg:text-[220px] font-black leading-none text-neutral-300/30 select-none"
                style={{ 
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {rank}
              </motion.span>
            </div>
          )}

          {/* Product Image Container - Neutral */}
          <motion.div 
            className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 lg:rounded-3xl z-10"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {soldOut && (
              <div className="absolute left-3 top-3 z-10 rounded-full bg-neutral-900/90 backdrop-blur-sm px-3 py-1.5 ring-1 ring-white/20">
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
                
                {/* Subtle neutral overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-400 text-sm">
                No image
              </div>
            )}
          </motion.div>
          
          {/* Product Info - Always Visible, Neutral Colors */}
          <div className="mt-4 space-y-2 lg:mt-5 lg:space-y-2.5">
            {/* Brand Name */}
            {listing.brand && (
              <p className="text-[11px] lg:text-xs font-bold uppercase tracking-wide text-neutral-400">
                {listing.brand}
              </p>
            )}
            
            {/* Product Title - Always Visible */}
            <h3 className="text-base lg:text-lg font-semibold text-neutral-900 leading-snug group-hover:text-neutral-700 transition-colors line-clamp-2">
              {listing.title}
            </h3>
            
            {/* Price Only - Zellerfeld style */}
            <div className="pt-0.5">
              {startingPrice != null && (
                <span className="text-lg lg:text-xl font-bold text-neutral-900">
                  ${startingPrice.toLocaleString()}
                  {listing.pricingMode === PricingMode.TIER && "+"}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    </MagneticHover>
  );
}
