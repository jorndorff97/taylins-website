"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp } from "@/lib/animations";

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
      className="relative overflow-hidden border-t border-slate-100 py-20 sm:py-32"
    >
      {/* Background Pattern - Reduced opacity */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-hero-accent blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-hero-secondary blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Centered Content */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto text-center space-y-8"
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
              className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
            >
              We partner exclusively with verified wholesalers and authenticate every pair before it reaches you. No fakes, no compromises.
            </motion.p>
          </div>

          {/* Benefits List - Grid Layout */}
          <motion.div 
            className="grid gap-4 sm:grid-cols-3 mt-12"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ delay: 0.5 }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all will-animate"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-hero-accent/10 to-hero-secondary/10 flex items-center justify-center text-2xl font-bold">
                    {benefit.icon === "CHECK" && <span className="text-emerald-600">✓</span>}
                    {benefit.icon === "LOCK" && <span className="text-slate-700">◆</span>}
                    {benefit.icon === "STAR" && <span className="text-hero-accent">★</span>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
