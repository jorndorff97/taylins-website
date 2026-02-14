"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp } from "@/lib/animations";
import { useBackgroundColors } from "@/context/BackgroundColorContext";

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
  const { themeColors } = useBackgroundColors();

  const colorTransition = { duration: 1.5, ease: 'easeInOut' };

  return (
    <motion.section 
      ref={ref}
      className="relative overflow-hidden border-t py-20 sm:py-32"
      animate={{
        backgroundColor: themeColors.backgroundTint,
        borderColor: themeColors.borderColor,
      }}
      transition={colorTransition}
    >
      {/* Background Pattern Blobs - Dynamic colors */}
      <motion.div 
        className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl opacity-20"
        animate={{
          backgroundColor: themeColors.primaryAccent,
        }}
        transition={colorTransition}
      />
      <motion.div 
        className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl opacity-15"
        animate={{
          backgroundColor: themeColors.secondaryAccent,
        }}
        transition={colorTransition}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Centered Content */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto text-center space-y-8"
        >
          <div>
            {/* Badge with dynamic accent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { 
                opacity: 1, 
                y: 0,
                backgroundColor: `${themeColors.primaryAccent}1A`, // 10% opacity
                color: themeColors.primaryAccent,
              } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, ...colorTransition }}
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
            >
              Authenticity Verified
            </motion.div>
            
            {/* Heading with adaptive text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { 
                opacity: 1, 
                y: 0,
                color: themeColors.textPrimary,
              } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, ...colorTransition }}
              className="mt-4 text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl"
            >
              Every pair.
              <br />
              <motion.span 
                className="font-extralight"
                animate={{
                  color: themeColors.primaryAccent,
                }}
                transition={colorTransition}
              >
                100% authentic.
              </motion.span>
            </motion.h2>

            {/* Body text with adaptive secondary color */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { 
                opacity: 1, 
                y: 0,
                color: themeColors.textSecondary,
              } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, ...colorTransition }}
              className="mt-6 text-lg leading-relaxed max-w-2xl mx-auto"
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
                animate={isInView ? { 
                  opacity: 1, 
                  y: 0,
                  backgroundColor: themeColors.cardBackground,
                  borderColor: themeColors.borderColor,
                } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.6 + index * 0.1, ...colorTransition }}
                className="p-6 rounded-2xl backdrop-blur-sm border hover:shadow-lg will-animate"
                style={{
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Icon background with gradient */}
                  <motion.div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold"
                    animate={{
                      background: `linear-gradient(135deg, ${themeColors.primaryAccent}1A, ${themeColors.secondaryAccent}1A)`,
                    }}
                    transition={colorTransition}
                  >
                    {benefit.icon === "CHECK" && (
                      <motion.span 
                        animate={{ color: themeColors.primaryAccent }}
                        transition={colorTransition}
                      >
                        ✓
                      </motion.span>
                    )}
                    {benefit.icon === "LOCK" && (
                      <motion.span 
                        animate={{ color: themeColors.textPrimary }}
                        transition={colorTransition}
                      >
                        ◆
                      </motion.span>
                    )}
                    {benefit.icon === "STAR" && (
                      <motion.span 
                        animate={{ color: themeColors.primaryAccent }}
                        transition={colorTransition}
                      >
                        ★
                      </motion.span>
                    )}
                  </motion.div>
                  <div>
                    <motion.h3 
                      className="font-semibold"
                      animate={{ color: themeColors.textPrimary }}
                      transition={colorTransition}
                    >
                      {benefit.title}
                    </motion.h3>
                    <motion.p 
                      className="mt-2 text-sm"
                      animate={{ color: themeColors.textSecondary }}
                      transition={colorTransition}
                    >
                      {benefit.description}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
