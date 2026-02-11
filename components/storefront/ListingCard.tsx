"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
  const primaryImage = listing.images[0]?.url;
  const soldOut = isSoldOut(listing);
  const startingPrice = getStartingPricePerPair({
    listing,
    tiers: listing.tierPrices ?? [],
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="will-animate"
    >
      <Link
        href={`/listing/${listing.id}`}
        className="group block"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
          {rank != null && (
            <span className="absolute left-4 top-4 text-8xl font-bold leading-none text-white/40 z-10">
              {rank}
            </span>
          )}
          {soldOut && (
            <span className="absolute left-4 top-4 rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white z-10">
              Sold Out
            </span>
          )}
          
          {primaryImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImage}
                alt={listing.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Glassmorphic Overlay on Hover */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 glass-card-dark flex items-center justify-center"
              >
                <div className="text-center space-y-3 p-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white"
                  >
                    <div className="text-sm font-medium text-white/80 mb-1">
                      Starting at
                    </div>
                    {startingPrice != null && (
                      <div className="text-3xl font-bold">
                        ${startingPrice.toLocaleString()}
                        {listing.pricingMode === PricingMode.TIER && "+"}
                      </div>
                    )}
                  </motion.div>
                  
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-slate-900 hover:bg-white/90 transition-colors"
                  >
                    Quick View
                    <span aria-hidden>→</span>
                  </motion.button>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              No image
            </div>
          )}
        </div>
        
        <motion.div 
          className="mt-4 space-y-1.5 px-1"
          animate={{ opacity: isHovered ? 0.7 : 1 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
      </Link>
    </motion.div>
  );
}
