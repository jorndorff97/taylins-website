"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, slideInLeft, slideInRight } from "@/lib/animations";

const benefits = [
  {
    icon: "CHECK",
    title: "Every pair verified",
    description: "Rigorous authentication process for all products"
  },
  {
    icon: "LOCK",
    title: "Direct from trusted sources",
    description: "Partnerships with verified wholesalers only"
  },
  {
    icon: "STAR",
    title: "Quality guaranteed",
    description: "100% satisfaction or full refund policy"
  }
];

export function AuthenticitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="relative overflow-hidden border-t border-slate-100 bg-gradient-to-b from-white via-slate-50/30 to-white py-20 sm:py-32"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-hero-accent blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-hero-secondary blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left - Image */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl">
              {/* Placeholder for sneaker image with verification badges */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Large Sneaker Image */}
                  <div className="h-64 w-64 rounded-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" 
                      alt="Premium sneaker" 
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                  
                  {/* Floating Verification Badges */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                    className="absolute -top-4 -right-4 glass-card rounded-2xl px-4 py-2 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-emerald-600">✓</span>
                      <span className="text-sm font-semibold text-emerald-600">Verified</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                    className="absolute -bottom-4 -left-4 glass-card rounded-2xl px-4 py-2 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-slate-700">◆</span>
                      <span className="text-sm font-semibold text-slate-700">Authentic</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                    className="absolute top-1/2 -right-6 glass-card rounded-2xl px-4 py-2 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-hero-accent">★</span>
                      <span className="text-sm font-semibold text-hero-accent">Premium</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute inset-0 -z-10 blur-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-hero-accent/20 via-transparent to-hero-secondary/20 rounded-3xl" />
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-8"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
                className="inline-block rounded-full bg-hero-accent/10 px-4 py-1.5 text-sm font-semibold text-hero-accent"
              >
                Authenticity Verified
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-4xl font-light tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
              >
                Every pair.
                <br />
                <span className="font-extralight text-hero-accent">100% authentic.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-lg text-slate-600 leading-relaxed"
              >
                We partner exclusively with verified wholesalers and authenticate every pair before it reaches you. No fakes, no compromises.
              </motion.p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all will-animate"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-hero-accent/10 to-hero-secondary/10 flex items-center justify-center text-xl font-bold">
                    {benefit.icon === "CHECK" && <span className="text-emerald-600">✓</span>}
                    {benefit.icon === "LOCK" && <span className="text-slate-700">◆</span>}
                    {benefit.icon === "STAR" && <span className="text-hero-accent">★</span>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
