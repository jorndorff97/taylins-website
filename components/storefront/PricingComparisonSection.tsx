"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { fadeInUp } from "@/lib/animations";

interface PricingData {
  id: number;
  product: string;
  stockXPrice: number;
  ourPrice: number;
  savings: number;
  savingsPercent: number;
  imageUrl?: string;
}

interface PricingComparisonSectionProps {
  products: PricingData[];
}

export function PricingComparisonSection({ products }: PricingComparisonSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [counter, setCounter] = useState(0);

  // Don't render if no products
  if (!products || products.length === 0) {
    return null;
  }

  const currentProduct = products[selectedProduct];
  const savings = currentProduct.savings;
  const savingsPercent = Math.round(currentProduct.savingsPercent);

  // Auto-rotate products
  useEffect(() => {
    if (products.length <= 1) return;
    
    const interval = setInterval(() => {
      setSelectedProduct((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  // Animated counter
  useEffect(() => {
    if (!isInView) return;
    
    setCounter(0);
    const duration = 1000;
    const steps = 50;
    const increment = savings / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= savings) {
        setCounter(savings);
        clearInterval(timer);
      } else {
        setCounter(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, savings, selectedProduct]);

  return (
    <section 
      ref={ref}
      className="relative overflow-hidden border-t border-slate-100 bg-white/40 py-20 sm:py-32"
    >
      {/* Animated Background Gradient - Removed since red waves handle it */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-hero-accent blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-hero-secondary blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-600">
              Better Pricing
            </div>
            
            <h2 className="mt-4 text-4xl font-light tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Beat StockX.
              <br />
              <span className="font-extralight text-hero-accent">Every time.</span>
            </h2>

            <p className="mt-6 text-lg text-slate-600">
              Our direct wholesale relationships mean better prices for you. See the difference.
            </p>
          </motion.div>

          {/* Interactive Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 20 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ scale: 1.02, rotateY: 2 }}
            className="mt-12 mx-auto max-w-2xl will-animate"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <div className="glass-card rounded-3xl p-8 shadow-2xl border-2 border-white/20">
              {/* Product Selector Dots */}
              {products.length > 1 && (
                <div className="flex justify-center gap-2 mb-6">
                  {products.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedProduct(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === selectedProduct 
                          ? "w-8 bg-hero-accent" 
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Select product ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Product Name */}
              <motion.h3
                key={selectedProduct}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-slate-900 mb-8"
              >
                {currentProduct.product}
              </motion.h3>

              {/* Price Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* StockX Price */}
                <motion.div
                  key={`stockx-${selectedProduct}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative p-6 rounded-2xl bg-slate-100/80"
                >
                  <div className="text-sm font-medium text-slate-500 mb-2">StockX Price</div>
                  <div className="text-3xl font-bold text-slate-400 line-through">
                    ${currentProduct.stockXPrice}
                  </div>
                </motion.div>

                {/* Our Price */}
                <motion.div
                  key={`our-${selectedProduct}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 ring-2 ring-emerald-500/20"
                >
                  <div className="text-sm font-medium text-emerald-600 mb-2">Our Price</div>
                  <div className="text-3xl font-bold text-emerald-600">
                    ${currentProduct.ourPrice}
                  </div>
                </motion.div>
              </div>

              {/* Savings Display */}
              <motion.div
                key={`savings-${selectedProduct}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-hero-accent/10 to-hero-secondary/10 border-2 border-hero-accent/20"
              >
                <div className="text-sm font-medium text-slate-600 mb-2">You Save</div>
                <div className="flex items-baseline justify-center gap-3">
                  <motion.span
                    key={counter}
                    className="text-5xl font-bold text-hero-accent"
                  >
                    ${counter}
                  </motion.span>
                  <span className="text-2xl font-semibold text-hero-accent/70">
                    ({savingsPercent}% off)
                  </span>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <p className="text-sm text-slate-500">
                  Based on real market data. Savings vary by product and quantity.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
