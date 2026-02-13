"use client";

import { motion } from "framer-motion";

export function RedWaveBackground() {
  // Aurora wave layer configurations - Northern Lights inspired
  const waves = [
    {
      // Wave 1 - Bottom layer, largest, slowest (Deep burgundy base)
      size: { width: '220%', height: '800px' },
      position: { bottom: '0%', left: '-60%' },
      gradient: 'radial-gradient(ellipse at center, rgba(136,19,55,0.85) 0%, rgba(127,29,29,0.65) 40%, rgba(185,28,28,0.5) 70%, transparent 100%)',
      borderRadius: '35% 65% 55% 45% / 50% 45% 55% 50%',
      animation: { 
        x: ['0%', '15%', '-10%', '0%'],
        y: ['0%', '-8%', '5%', '0%'],
        scale: [1, 1.08, 0.98, 1],
      },
      duration: 45,
      opacity: 0.75,
    },
    {
      // Wave 2 - Mid-back layer (Rich crimson with bright highlights)
      size: { width: '200%', height: '700px' },
      position: { bottom: '5%', left: '20%' },
      gradient: 'radial-gradient(ellipse at 40% 50%, rgba(220,38,38,0.9) 0%, rgba(185,28,28,0.7) 35%, rgba(127,29,29,0.5) 65%, transparent 100%)',
      borderRadius: '40% 60% 50% 50% / 45% 55% 45% 55%',
      animation: { 
        x: ['0%', '-20%', '15%', '0%'],
        y: ['0%', '12%', '-8%', '0%'],
        scale: [1, 1.12, 1.05, 1],
      },
      duration: 32,
      opacity: 0.8,
    },
    {
      // Wave 3 - Middle layer (Bright red to deep crimson)
      size: { width: '190%', height: '650px' },
      position: { bottom: '10%', left: '-40%' },
      gradient: 'radial-gradient(ellipse at 60% 40%, rgba(239,68,68,0.95) 0%, rgba(220,38,38,0.75) 30%, rgba(159,18,57,0.6) 60%, transparent 100%)',
      borderRadius: '30% 70% 60% 40% / 50% 40% 60% 50%',
      animation: { 
        x: ['0%', '25%', '-15%', '0%'],
        y: ['0%', '-15%', '10%', '0%'],
        scale: [1, 1.15, 0.95, 1],
        rotate: [0, 3, -2, 0],
      },
      duration: 28,
      opacity: 0.85,
    },
    {
      // Wave 4 - Mid-front layer, faster (Vibrant crimson with coral accents)
      size: { width: '170%', height: '550px' },
      position: { bottom: '15%', left: '30%' },
      gradient: 'radial-gradient(ellipse at 50% 60%, rgba(239,68,68,0.95) 0%, rgba(248,113,113,0.85) 25%, rgba(220,38,38,0.65) 55%, transparent 100%)',
      borderRadius: '45% 55% 48% 52% / 55% 50% 50% 45%',
      animation: { 
        x: ['0%', '-30%', '20%', '0%'],
        y: ['0%', '18%', '-12%', '0%'],
        scale: [1, 1.18, 1.08, 1],
        rotate: [0, -4, 3, 0],
      },
      duration: 18,
      opacity: 0.88,
    },
    {
      // Wave 5 - Front layer, fastest (Bright red highlights)
      size: { width: '160%', height: '500px' },
      position: { bottom: '20%', left: '-30%' },
      gradient: 'radial-gradient(ellipse at 45% 55%, rgba(248,113,113,0.95) 0%, rgba(239,68,68,0.9) 20%, rgba(220,38,38,0.7) 50%, transparent 100%)',
      borderRadius: '38% 62% 55% 45% / 48% 52% 48% 52%',
      animation: { 
        x: ['0%', '35%', '-25%', '0%'],
        y: ['0%', '-20%', '15%', '0%'],
        scale: [1, 1.2, 0.92, 1],
        rotate: [0, 5, -4, 0],
      },
      duration: 12,
      opacity: 0.9,
    },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background - deep crimson to rich red (northern lights night sky) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4a0404] via-[#7f1d1d] to-[#991b1b]" />
      
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
            y: wave.animation.y,
            scale: wave.animation.scale,
            rotate: wave.animation.rotate || [0],
          }}
          transition={{
            duration: wave.duration,
            repeat: Infinity,
            ease: 'easeInOut',
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
