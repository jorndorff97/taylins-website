"use client";

import { motion } from "framer-motion";
import { useBackgroundColors } from "@/context/BackgroundColorContext";

export function RedWaveBackground() {
  const { colors } = useBackgroundColors();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Dynamic diagonal gradient background with smooth transitions */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `linear-gradient(135deg, ${colors.from}, ${colors.via}, ${colors.to})`,
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
