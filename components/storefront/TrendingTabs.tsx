"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingCarousel } from "./TrendingCarousel";
import type { Listing, ListingImage, ListingSize, ListingTierPrice } from "@prisma/client";

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

interface TrendingTabsProps {
  trendingListings: (SerializedListing & {
    images: ListingImage[];
    sizes?: ListingSize[];
    tierPrices?: SerializedTierPrice[];
  })[];
  bestDealsListings: (SerializedListing & {
    images: ListingImage[];
    sizes?: ListingSize[];
    tierPrices?: SerializedTierPrice[];
  })[];
}

export function TrendingTabs({ trendingListings, bestDealsListings }: TrendingTabsProps) {
  const [activeTab, setActiveTab] = useState<"trending" | "bestDeals">("trending");
  
  const tabs = [
    { id: "trending" as const, label: "Trending" },
    { id: "bestDeals" as const, label: "Best Deals" },
  ];
  
  // Dynamic title based on active tab
  const sectionTitle = activeTab === "trending" ? "Trending Now" : "Best Deals";
  
  return (
    <div>
      {/* Dynamic Section Title */}
      <div className="mb-6 sm:mb-8">
        <AnimatePresence mode="wait">
          <motion.h2
            key={activeTab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-3xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text text-transparent sm:text-4xl lg:text-5xl pb-2 leading-tight"
          >
            {sectionTitle}
          </motion.h2>
        </AnimatePresence>
      </div>
      
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? "text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white border border-neutral-200 rounded-lg shadow-sm"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Carousel Content with Slide Transition */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ x: activeTab === "bestDeals" ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: activeTab === "bestDeals" ? -100 : 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <TrendingCarousel 
              listings={activeTab === "trending" ? trendingListings : bestDealsListings}
              showDiscount={activeTab === "bestDeals"}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
