"use client";

import { motion } from "framer-motion";
import { useBackgroundColors } from "@/context/BackgroundColorContext";

export function RedWaveBackground() {
  const { colors } = useBackgroundColors();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Simple color-to-white gradient with smooth transitions */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `linear-gradient(180deg, ${colors.from} 0%, ${colors.via} 40%, ${colors.to} 80%)`,
        }}
        transition={{
          duration: 1.2,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
