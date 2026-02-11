"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { textRotate } from "@/lib/animations";
import { AnimatedGradientBackground } from "./AnimatedGradientBackground";
import { FloatingElements } from "./FloatingElements";
import { useParallax } from "@/hooks/useScrollProgress";

interface HeroProduct {
  id: number;
  title: string;
  imageUrl: string;
}

interface HeroSectionProps {
  heroProducts: HeroProduct[];
  stats: {
    totalPairs: number;
    activeListings: number;
    avgSavings: number;
  };
}

const ROTATING_TEXTS = [
  { text: "Bulk savings.", color: "text-hero-accent" },
  { text: "Direct sourcing.", color: "text-hero-secondary" },
  { text: "Verified authentic.", color: "text-slate-900" },
  { text: "Volume pricing.", color: "text-hero-accent" },
];

export function HeroSection({ heroProducts, stats }: HeroSectionProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const parallaxY = useParallax(50);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentText = ROTATING_TEXTS[currentTextIndex];

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Animated Gradient Background */}
      <AnimatedGradientBackground parallaxY={parallaxY} />
      
      {/* Floating Particles */}
      <FloatingElements />
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/60 to-white/80" />

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 className="text-4xl font-light tracking-tight leading-tight text-slate-900 sm:text-5xl sm:tracking-tighter md:text-6xl lg:text-7xl xl:text-8xl">
            Wholesale sneakers.
            <br />
            {/* Rotating Text */}
            <div className="relative inline-block h-[1.2em] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentTextIndex}
                  variants={textRotate}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`absolute left-0 right-0 font-extralight ${currentText.color}`}
                  style={{ transformOrigin: "center center" }}
                >
                  {currentText.text}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="mt-6 text-base text-slate-500 leading-relaxed sm:mt-8 sm:text-lg md:text-xl lg:text-2xl px-2 sm:px-0 max-w-2xl mx-auto"
        >
          Premium wholesale marketplace built for retailers who demand quality and value.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Link
            href="/browse"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3 text-sm font-medium text-white transition hover:bg-slate-800 hover:scale-105 sm:mt-12 sm:px-10 sm:py-4 sm:text-base will-animate"
          >
            Explore listings
            <span aria-hidden>→</span>
          </Link>
        </motion.div>

        {/* Glassmorphic Stat Cards - Desktop Only */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mt-16 hidden sm:flex flex-wrap justify-center gap-4 sm:mt-20 sm:gap-6"
        >
          <StatCard 
            label="Total Pairs" 
            value={stats.totalPairs.toLocaleString()} 
            delay={0.7}
          />
          <StatCard 
            label="Active Listings" 
            value={stats.activeListings.toString()} 
            delay={0.8}
          />
          <StatCard 
            label="Avg. Savings" 
            value={`${stats.avgSavings}%`} 
            delay={0.9}
            highlight
          />
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ 
  label, 
  value, 
  delay, 
  highlight 
}: { 
  label: string; 
  value: string; 
  delay: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.05, y: -4 }}
      className={`glass-card rounded-2xl px-6 py-4 backdrop-blur-xl will-animate ${
        highlight ? "ring-2 ring-hero-accent/20" : ""
      }`}
    >
      <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold ${
        highlight ? "text-hero-accent" : "text-slate-900"
      }`}>
        {value}
      </div>
    </motion.div>
  );
}
