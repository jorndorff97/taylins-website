"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const BASE_COUNT = 3000;
const BASE_DATE = new Date("2026-02-22T00:00:00Z");
const PAIRS_PER_DAY = 6;

const testimonials = [
  {
    quote:
      "Saved over $200 on Jordan 4s. Came double-boxed with receipt. I won't buy anywhere else now.",
    author: "Marcus T.",
    location: "Atlanta, GA",
    verified: true,
  },
  {
    quote:
      "Was skeptical at first, but these prices are real. Third order and every pair has been flawless.",
    author: "Jasmine R.",
    location: "Houston, TX",
    verified: true,
  },
  {
    quote:
      "Better prices than StockX, faster than GOAT. This is where I get all my kicks now. Period.",
    author: "Devon K.",
    location: "Chicago, IL",
    verified: true,
  },
];

const trustMetrics = [
  { value: "100%", label: "Authenticity Rate" },
  { value: "4.9/5", label: "Customer Rating" },
  { value: "<24hr", label: "Avg. Ship Time" },
  { value: "30-Day", label: "Money-Back Guarantee" },
];

export function SocialProofSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const [displayCount, setDisplayCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [liveCount, setLiveCount] = useState(BASE_COUNT);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [justIncremented, setJustIncremented] = useState(false);

  useEffect(() => {
    const now = new Date();
    const daysSinceLaunch =
      (now.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24);
    setLiveCount(
      BASE_COUNT + Math.floor(Math.max(0, daysSinceLaunch) * PAIRS_PER_DAY)
    );
  }, []);

  useEffect(() => {
    if (!isInView || hasAnimated) return;

    const target = liveCount;
    const duration = 2500;
    const startTime = performance.now();

    function easeOutExpo(t: number) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    let frameId: number;
    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayCount(Math.floor(target * easeOutExpo(progress)));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setHasAnimated(true);
      }
    }

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, hasAnimated, liveCount]);

  useEffect(() => {
    if (hasAnimated) {
      setDisplayCount(liveCount);
    }
  }, [liveCount, hasAnimated]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    function scheduleIncrement() {
      const delay = 30000 + Math.random() * 45000;
      timeoutId = setTimeout(() => {
        setLiveCount((prev) => prev + 1);
        setJustIncremented(true);
        setTimeout(() => setJustIncremented(false), 2000);
        scheduleIncrement();
      }, delay);
    }

    scheduleIncrement();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-24 sm:py-32"
    >
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Counter */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 ring-1 ring-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold tracking-wide text-emerald-700">
              Trusted Nationwide
            </span>
          </div>

          <div className="mt-8">
            <motion.div
              animate={justIncremented ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="relative inline-block"
            >
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl lg:text-9xl">
                {displayCount.toLocaleString()}
              </span>
              <span className="ml-1 text-4xl font-light text-emerald-500 sm:text-5xl lg:text-6xl">
                +
              </span>
            </motion.div>
          </div>

          <p className="mt-4 text-xl font-light tracking-wide text-slate-600 sm:text-2xl">
            Pairs Sold{" "}
            <span className="font-medium text-emerald-600">&amp;</span> Counting
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            Every pair authenticated. Every customer satisfied.
          </p>
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
        >
          {trustMetrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="group relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-md hover:ring-emerald-200/60"
            >
              <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {metric.value}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-500">
                {metric.label}
              </div>
              <div className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mx-auto mt-16 max-w-2xl"
        >
          <div className="relative min-h-[200px] sm:min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="flex justify-center gap-1 text-emerald-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="mt-4 text-lg font-light italic leading-relaxed text-slate-700 sm:text-xl">
                  &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                </blockquote>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-slate-900">
                    {testimonials[activeTestimonial].author}
                  </span>
                  <span className="text-slate-300">&middot;</span>
                  <span className="text-sm text-slate-500">
                    {testimonials[activeTestimonial].location}
                  </span>
                  {testimonials[activeTestimonial].verified && (
                    <>
                      <span className="text-slate-300">&middot;</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified Buyer
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeTestimonial
                    ? "w-6 bg-emerald-500"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`View testimonial ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
