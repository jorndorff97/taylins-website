"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBackgroundColors } from "@/context/BackgroundColorContext";
import { extractGradientColors } from "@/hooks/useProductColors";

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

function DealCard({ deal }: { deal: DealData }) {
  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
      {/* Product Image */}
      <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-2">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-full w-full object-contain"
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
      <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-700 font-bold rounded-full px-4 py-2">
        <span className="text-lg">Save {deal.savingsPercent}%</span>
        <span className="text-xs opacity-75">${deal.savingsDollar.toFixed(0)}</span>
      </div>
    </div>
  );
}

export function PhoneMockup({ deals }: PhoneMockupProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { setColors } = useBackgroundColors();

  // Extract colors when active product changes
  useEffect(() => {
    const extractColors = async () => {
      const currentDeal = deals[activeIndex];
      console.log('Extracting colors for product:', currentDeal?.title, currentDeal?.imageUrl);
      
      if (!currentDeal?.imageUrl) {
        console.log('No image URL, using white fallback');
        setColors({ from: '#FFFFFF', via: '#F5F5F5', to: '#E5E5E5' });
        return;
      }

      try {
        const gradientColors = await extractGradientColors(currentDeal.imageUrl);
        console.log('Setting gradient colors:', gradientColors);
        setColors(gradientColors);
      } catch (error) {
        console.error('Color extraction failed:', error);
        setColors({ from: '#FFFFFF', via: '#F5F5F5', to: '#E5E5E5' });
      }
    };

    extractColors();
  }, [activeIndex, deals, setColors]);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (deals.length <= 1) return;

    console.log('Starting auto-rotation with', deals.length, 'deals');
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % deals.length;
        console.log('Auto-rotating from index', prev, 'to', nextIndex);
        return nextIndex;
      });
    }, 4000);

    return () => {
      console.log('Cleaning up auto-rotation interval');
      clearInterval(interval);
    };
  }, [deals.length]);

  if (deals.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone Frame */}
      <div className="w-[280px] h-[350px] sm:w-[320px] sm:h-[500px] bg-white/80 backdrop-blur-sm border-[8px] border-neutral-200/80 rounded-[3rem] sm:shadow-2xl sm:shadow-neutral-900/10 p-2 overflow-hidden">
        {/* Screen Content with AnimatePresence for smooth transitions */}
        <div className="w-full h-full rounded-[2.5rem] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={deals[activeIndex].id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full h-full absolute inset-0 p-2"
            >
              <DealCard deal={deals[activeIndex]} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
