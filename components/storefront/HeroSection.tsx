"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParallax } from "@/hooks/useScrollProgress";
import { PhoneMockup } from "./PhoneMockup";
import { BrandCarousel } from "./BrandCarousel";

interface HeroProduct {
  id: number;
  title: string;
  imageUrl: string;
}

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

interface HeroSectionProps {
  heroProducts: HeroProduct[];
  topDeals: DealData[];
}

export function HeroSection({ heroProducts, topDeals }: HeroSectionProps) {
  const parallaxY = useParallax(50);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent pt-24 sm:pt-32">
      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 w-full">
        {/* 3-Column Layout (Desktop) / Stacked (Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
          {/* Center: Headline + Phone Mockup - Order 1 on mobile, Order 2 on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-6 order-1 md:order-2"
          >
            <h1 className="text-4xl font-light tracking-tight leading-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl text-center">
              Wholesale sneakers.
            </h1>
            <PhoneMockup deals={topDeals} />
          </motion.div>

          {/* Left: Subheading + CTA - Order 2 on mobile, Order 1 on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="text-center md:text-left space-y-6 order-2 md:order-1"
          >
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Premium wholesale marketplace built for retailers who demand quality and value.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 hover:scale-105 will-animate"
            >
              Explore listings
              <span aria-hidden>→</span>
            </Link>
          </motion.div>

          {/* Right: Brand Carousel (hidden on mobile) - Order 3 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="hidden md:block order-3"
          >
            <BrandCarousel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
