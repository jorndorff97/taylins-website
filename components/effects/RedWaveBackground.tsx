"use client";

import { motion } from "framer-motion";

export function RedWaveBackground() {
  // Wave layer configurations
  const waves = [
    {
      // Wave 1 - Bottom layer, largest, slowest
      size: { width: '200%', height: '600px' },
      position: { bottom: '0%', left: '-50%' },
      gradient: 'linear-gradient(90deg, rgba(250,250,250,0) 0%, rgba(240,240,240,0.4) 25%, rgba(220,220,220,0.5) 50%, rgba(240,240,240,0.4) 75%, rgba(250,250,250,0) 100%)',
      borderRadius: '40% 60% 55% 45% / 70% 70% 30% 30%',
      animation: { x: ['-50%', '50%'], duration: 60 },
      opacity: 0.5,
    },
    {
      // Wave 2 - Mid layer, gray with light red tint
      size: { width: '180%', height: '500px' },
      position: { bottom: '5%', left: '30%' },
      gradient: 'linear-gradient(90deg, rgba(254,202,202,0) 0%, rgba(240,240,240,0.3) 20%, rgba(254,202,202,0.35) 50%, rgba(240,240,240,0.3) 80%, rgba(254,202,202,0) 100%)',
      borderRadius: '50% 50% 60% 40% / 60% 40% 60% 40%',
      animation: { x: ['30%', '-70%'], duration: 45 },
      opacity: 0.4,
    },
    {
      // Wave 3 - Mid layer, neutral with subtle red
      size: { width: '170%', height: '450px' },
      position: { bottom: '10%', left: '-60%' },
      gradient: 'linear-gradient(90deg, rgba(220,220,220,0) 0%, rgba(239,68,68,0.08) 30%, rgba(240,240,240,0.4) 50%, rgba(239,68,68,0.08) 70%, rgba(220,220,220,0) 100%)',
      borderRadius: '45% 55% 50% 50% / 55% 45% 55% 45%',
      animation: { x: ['-60%', '60%'], duration: 50 },
      opacity: 0.35,
    },
    {
      // Wave 4 - Upper layer, faster with red accents
      size: { width: '160%', height: '400px' },
      position: { bottom: '15%', left: '40%' },
      gradient: 'linear-gradient(90deg, rgba(254,202,202,0) 0%, rgba(239,68,68,0.15) 30%, rgba(254,202,202,0.25) 50%, rgba(239,68,68,0.15) 70%, rgba(254,202,202,0) 100%)',
      borderRadius: '55% 45% 45% 55% / 50% 60% 40% 50%',
      animation: { x: ['40%', '-60%'], duration: 35 },
      opacity: 0.3,
    },
    {
      // Wave 5 - Top layer, smallest, fastest
      size: { width: '150%', height: '350px' },
      position: { bottom: '20%', left: '-40%' },
      gradient: 'linear-gradient(90deg, rgba(240,240,240,0) 0%, rgba(239,68,68,0.12) 25%, rgba(220,220,220,0.3) 50%, rgba(239,68,68,0.12) 75%, rgba(240,240,240,0) 100%)',
      borderRadius: '50% 50% 55% 45% / 45% 55% 45% 55%',
      animation: { x: ['-40%', '60%'], duration: 30 },
      opacity: 0.25,
    },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background - white to very light gray */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-neutral-50" />
      
      {/* Aurora wave layers */}
      {waves.map((wave, index) => (
        <motion.div
          key={`wave-${index}`}
          className="absolute"
          style={{
            width: wave.size.width,
            height: wave.size.height,
            bottom: wave.position.bottom,
            left: wave.position.left,
            background: wave.gradient,
            borderRadius: wave.borderRadius,
            opacity: wave.opacity,
            willChange: 'transform',
            transform: 'translate3d(0, 0, 0)',
          }}
          animate={{
            x: wave.animation.x,
          }}
          transition={{
            duration: wave.animation.duration,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }}
        />
      ))}
      
      {/* Subtle grain texture overlay for richness */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
