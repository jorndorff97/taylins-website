"use client";

import { motion } from "framer-motion";

export function LandscapeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {/* Grass/ground layer at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-sage-light/40 to-transparent" />
      
      {/* Abstract rock/stone shapes - subtle organic forms */}
      <motion.div
        className="absolute bottom-12 left-[10%] w-40 h-32 rounded-full bg-neutral-300/30 blur-3xl"
        animate={{ y: [0, -10, 0], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-16 right-[15%] w-48 h-36 rounded-full bg-neutral-400/20 blur-3xl"
        animate={{ y: [0, -15, 0], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-20 left-[30%] w-36 h-28 rounded-full bg-sage/15 blur-2xl"
        animate={{ y: [0, -12, 0], opacity: [0.25, 0.35, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-8 right-[40%] w-32 h-24 rounded-full bg-neutral-500/15 blur-3xl"
        animate={{ y: [0, -8, 0], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Additional subtle shapes for depth */}
      <motion.div
        className="absolute bottom-24 left-[60%] w-28 h-20 rounded-full bg-sage-dark/10 blur-2xl"
        animate={{ y: [0, -6, 0], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
