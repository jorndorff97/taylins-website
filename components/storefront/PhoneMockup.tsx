"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DealData {
  id: number;
  title: string;
  brand: string;
  imageUrl: string;
  ourPrice: number;
  stockXPrice: number;
  savingsPercent: number;
  savingsDollar: number;
}

interface PhoneMockupProps {
  deals: DealData[];
}

function PriceTrendGraph() {
  const bars = [65, 70, 60, 55, 50];
  
  return (
    <div className="flex items-end gap-1 h-12 mt-4">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="flex-1 bg-gradient-to-t from-neutral-300 to-neutral-200 rounded-t"
        />
      ))}
    </div>
  );
}

function DealCard({ deal }: { deal: DealData }) {
  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
      {/* Product Image */}
      <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden mb-4">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-1">
          {deal.brand}
        </p>
        <h3 className="text-sm font-semibold text-neutral-900 leading-tight line-clamp-2">
          {deal.title}
        </h3>
      </div>

      {/* Pricing */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-neutral-900">
            ${deal.ourPrice.toLocaleString()}
          </span>
          <span className="text-sm text-neutral-400 line-through">
            ${deal.stockXPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Savings Badge */}
      <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-700 font-bold rounded-full px-4 py-2 mb-3">
        <span className="text-lg">Save {deal.savingsPercent}%</span>
        <span className="text-xs opacity-75">${deal.savingsDollar.toFixed(0)}</span>
      </div>

      {/* Mini Graph */}
      <div className="mt-auto">
        <p className="text-xs text-neutral-400 mb-2">Price Trend</p>
        <PriceTrendGraph />
      </div>
    </div>
  );
}

export function PhoneMockup({ deals }: PhoneMockupProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (deals.length <= 1) return;

    const startAutoRotate = () => {
      autoRotateRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % deals.length);
      }, 5000);
    };

    startAutoRotate();

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [deals.length]);

  // Scroll to active card
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.offsetWidth;
      container.scrollTo({
        left: cardWidth * activeIndex,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  // Handle manual scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = container.offsetWidth;
    const newIndex = Math.round(container.scrollLeft / cardWidth);
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      
      // Reset auto-rotate timer
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
      autoRotateRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % deals.length);
      }, 5000);
    }
  };

  if (deals.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone Frame */}
      <div className="w-[280px] h-[350px] sm:w-[320px] sm:h-[500px] bg-white/80 backdrop-blur-sm border-[8px] border-neutral-200/80 rounded-[3rem] shadow-2xl shadow-neutral-900/10 p-2">
        {/* Screen Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide flex rounded-[2.5rem]"
        >
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="w-full h-full flex-shrink-0 snap-center p-2"
            >
              <DealCard deal={deal} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      {deals.length > 1 && (
        <div className="flex items-center gap-2">
          {deals.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-neutral-900 w-6"
                  : "bg-neutral-300 hover:bg-neutral-400"
              }`}
              aria-label={`Go to deal ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
