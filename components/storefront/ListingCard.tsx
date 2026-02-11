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
  
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -5;
    const rotateYValue = ((x - centerX) / centerX) * 5;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <MagneticHover strength={0.2}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.08,
          ease: [0.25, 0.1, 0.25, 1]
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="will-animate"
      >
        <Link
          href={`/listing/${listing.id}`}
          className="group block relative glow-border"
        >
          {/* Large Rank Number with Gradient */}
          {rank != null && (
            <div className="absolute -left-2 -top-3 lg:-left-4 lg:-top-6 z-20 pointer-events-none">
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.08 + 0.2, duration: 0.5 }}
                className="text-[140px] sm:text-[160px] lg:text-[220px] font-black leading-none gradient-text select-none"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {rank}
              </motion.span>
            </div>
          )}

          {/* Product Image Container with Shine Effect */}
          <motion.div 
            className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 lg:rounded-[2rem]"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {soldOut && (
              <div className="absolute left-3 top-3 z-10 rounded-full bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 ring-1 ring-white/20">
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
                
                {/* Gradient overlay with glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm">
                No image
              </div>
            )}
          </motion.div>
          
          {/* Product Info with Glowing Accents */}
          <div className="mt-4 space-y-2 lg:mt-5 lg:space-y-2.5">
            {/* Brand Name with Gradient */}
            {listing.brand && (
              <p className="text-[11px] lg:text-xs font-bold uppercase tracking-[0.15em] gradient-text">
                {listing.brand}
              </p>
            )}
            
            {/* Product Title - High Contrast */}
            <h3 className="text-base lg:text-lg font-semibold text-white leading-snug group-hover:text-neon-cyan transition-colors line-clamp-2">
              {listing.title}
            </h3>
            
            {/* Price & MOQ with Glow */}
            <div className="flex items-center gap-2.5 pt-0.5">
              {startingPrice != null && (
                <span className="text-lg lg:text-xl font-bold text-white">
                  ${startingPrice.toLocaleString()}
                  {listing.pricingMode === PricingMode.TIER && "+"}
                </span>
              )}
              <Badge 
                variant="default" 
                className="rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 text-[9px] font-semibold uppercase tracking-wide text-white px-2.5 py-0.5 ring-1 ring-white/20"
              >
                MOQ {listing.moq}
              </Badge>
            </div>
          </div>
        </Link>
      </motion.div>
    </MagneticHover>
  );
}
