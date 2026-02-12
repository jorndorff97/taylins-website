"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListingCard } from "./ListingCard";
import type { Listing, ListingImage, ListingSize, ListingTierPrice } from "@prisma/client";

interface TrendingCarouselProps {
  listings: (Listing & {
    images: ListingImage[];
    sizes?: ListingSize[];
    tierPrices?: ListingTierPrice[];
  })[];
}

export function TrendingCarousel({ listings }: TrendingCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check scroll position to show/hide arrows and update active index
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    
    // Calculate active slide index based on scroll position
    const cardWidth = scrollContainerRef.current.querySelector('div')?.offsetWidth || clientWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
    
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canScrollLeft) {
        scroll("left");
      } else if (e.key === "ArrowRight" && canScrollRight) {
        scroll("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canScrollLeft, canScrollRight]);

  if (listings.length === 0) {
    return <p className="text-slate-500">No listings yet. Check back soon.</p>;
  }

  return (
    <div className="relative">
      <div className="relative group">
        {/* Left Arrow - Desktop Only */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => scroll("left")}
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 hover:bg-white hover:scale-110 transition-all duration-200 -translate-x-6 opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <svg className="h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Carousel Container - Always horizontal scroll with snap */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
          {listings.map((listing, i) => (
            <div
              key={listing.id}
              className="snap-center shrink-0 w-[85vw] sm:w-[45%] lg:w-[calc(33.333%-1.33rem)]"
            >
              <ListingCard listing={listing} rank={i + 1} index={i} />
            </div>
          ))}
        </div>

        {/* Right Arrow - Desktop Only */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => scroll("right")}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 hover:bg-white hover:scale-110 transition-all duration-200 translate-x-6 opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <svg className="h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scroll Hint - Desktop Only */}
        {canScrollRight && (
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/50 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Pagination Dots - Mobile/Tablet Only */}
      <div className="flex justify-center gap-2 mt-6 lg:hidden">
        {listings.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!scrollContainerRef.current) return;
              const container = scrollContainerRef.current;
              const cardWidth = container.querySelector('div')?.offsetWidth || 0;
              container.scrollTo({
                left: cardWidth * i,
                behavior: "smooth",
              });
            }}
            className={`transition-all duration-300 rounded-full ${
              i === activeIndex
                ? "w-2 h-2 bg-neutral-900"
                : "w-2 h-2 bg-neutral-300 hover:bg-neutral-400"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
