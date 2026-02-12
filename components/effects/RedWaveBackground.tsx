"use client";

import { motion } from "framer-motion";

export function RedWaveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Wave Ripple 1 - Top Center */}
      <motion.div
        className="absolute top-[10%] left-[50%] w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(220,38,38,0.5) 0%, rgba(239,68,68,0.35) 25%, rgba(248,113,113,0.2) 50%, rgba(254,202,202,0.1) 75%, transparent 100%)',
          filter: 'blur(35px)',
          willChange: 'transform',
        }}
        animate={{
          scale: [0.5, 2.5, 0.5],
          opacity: [0.4, 0.7, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0,
        }}
      />

      {/* Wave Ripple 2 - Left Side */}
      <motion.div
        className="absolute top-[40%] left-[15%] w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.45) 0%, rgba(248,113,113,0.3) 30%, rgba(254,202,202,0.15) 60%, transparent 100%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
        animate={{
          scale: [0.6, 2.3, 0.6],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, -160, -320],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Wave Ripple 3 - Right Side */}
      <motion.div
        className="absolute top-[25%] right-[10%] w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(248,113,113,0.5) 0%, rgba(254,202,202,0.35) 35%, rgba(239,68,68,0.2) 65%, transparent 100%)',
          filter: 'blur(38px)',
          willChange: 'transform',
        }}
        animate={{
          scale: [0.7, 2.4, 0.7],
          opacity: [0.35, 0.65, 0.35],
          rotate: [0, 200, 400],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Wave Ripple 4 - Bottom Left */}
      <motion.div
        className="absolute bottom-[15%] left-[25%] w-[650px] h-[650px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, rgba(239,68,68,0.3) 28%, rgba(248,113,113,0.18) 55%, rgba(254,202,202,0.08) 80%, transparent 100%)',
          filter: 'blur(32px)',
          willChange: 'transform',
        }}
        animate={{
          scale: [0.5, 2.6, 0.5],
          opacity: [0.4, 0.7, 0.4],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Wave Ripple 5 - Bottom Right */}
      <motion.div
        className="absolute bottom-[20%] right-[20%] w-[750px] h-[750px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(254,202,202,0.5) 0%, rgba(248,113,113,0.35) 32%, rgba(239,68,68,0.22) 58%, rgba(220,38,38,0.12) 82%, transparent 100%)',
          filter: 'blur(36px)',
          willChange: 'transform',
        }}
        animate={{
          scale: [0.6, 2.5, 0.6],
          opacity: [0.35, 0.68, 0.35],
          rotate: [0, 220, 440],
        }}
        transition={{
          duration: 10.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      {/* Wave Ripple 6 - Center Deep */}
      <motion.div
        className="absolute top-[50%] left-[40%] w-[900px] h-[900px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.42) 0%, rgba(220,38,38,0.28) 26%, rgba(248,113,113,0.16) 52%, rgba(254,202,202,0.06) 78%, transparent 100%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
        animate={{
          scale: [0.55, 2.2, 0.55],
          opacity: [0.38, 0.65, 0.38],
          rotate: [0, -140, -280],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />
    </div>
  );
}
