"use client";

import { motion } from "framer-motion";

export function RedWaveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Large Primary Wave - Center */}
      <motion.div
        className="absolute top-[10%] left-[50%] w-[1000px] h-[1000px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, rgba(239,68,68,0.25) 40%, rgba(239,68,68,0) 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
        animate={{
          x: [-100, 150, -100],
          y: [0, -120, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary Wave - Left Side */}
      <motion.div
        className="absolute top-[30%] left-[5%] w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(248,113,113,0.5) 0%, rgba(248,113,113,0.2) 45%, rgba(248,113,113,0) 70%)',
          filter: 'blur(50px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, -80, 120, 0],
          y: [0, 100, -50, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Tertiary Wave - Right Side */}
      <motion.div
        className="absolute top-[50%] right-[10%] w-[900px] h-[900px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(220,38,38,0.45) 0%, rgba(220,38,38,0.18) 50%, rgba(220,38,38,0) 70%)',
          filter: 'blur(55px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, 100, -150, 0],
          y: [0, -80, 60, 0],
          scale: [1, 1.25, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Accent Wave - Upper Right */}
      <motion.div
        className="absolute top-[15%] right-[20%] w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(254,202,202,0.55) 0%, rgba(254,202,202,0.22) 40%, rgba(254,202,202,0) 70%)',
          filter: 'blur(45px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 90, -40, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Deep Wave - Bottom Left */}
      <motion.div
        className="absolute bottom-[10%] left-[15%] w-[850px] h-[850px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.52) 0%, rgba(239,68,68,0.22) 45%, rgba(239,68,68,0) 70%)',
          filter: 'blur(50px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, 140, -90, 0],
          y: [0, -70, 110, 0],
          scale: [1, 0.95, 1.3, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle Wave - Center Bottom */}
      <motion.div
        className="absolute bottom-[20%] left-[40%] w-[750px] h-[750px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(248,113,113,0.42) 0%, rgba(248,113,113,0.18) 50%, rgba(248,113,113,0) 70%)',
          filter: 'blur(45px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, -60, 100, 0],
          y: [0, 50, -80, 0],
          scale: [1, 1.2, 0.85, 1],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Additional Ambient Wave - Top Left */}
      <motion.div
        className="absolute top-[5%] left-[25%] w-[650px] h-[650px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(220,38,38,0.38) 0%, rgba(220,38,38,0.15) 55%, rgba(220,38,38,0) 70%)',
          filter: 'blur(48px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, 90, -110, 0],
          y: [0, -100, 70, 0],
          scale: [1, 1.1, 1.25, 1],
        }}
        transition={{
          duration: 21,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
