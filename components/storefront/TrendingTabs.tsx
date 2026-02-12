"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingCarousel } from "./TrendingCarousel";
import type { Listing, ListingImage, ListingSize, ListingTierPrice } from "@prisma/client";

interface TrendingTabsProps {
  trendingListings: (Listing & {
    images: ListingImage[];
    sizes?: ListingSize[];
    tierPrices?: ListingTierPrice[];
  })[];
  bestDealsListings: (Listing & {
    images: ListingImage[];
    sizes?: ListingSize[];
    tierPrices?: ListingTierPrice[];
  })[];
}

export function TrendingTabs({ trendingListings, bestDealsListings }: TrendingTabsProps) {
  const [activeTab, setActiveTab] = useState<"trending" | "bestDeals">("trending");
  
  const tabs = [
    { id: "trending" as const, label: "Trending" },
    { id: "bestDeals" as const, label: "Best Deals" },
  ];
  
  return (
    <div>
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
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
