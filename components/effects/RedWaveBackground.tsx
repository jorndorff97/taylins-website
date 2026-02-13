"use client";

import { motion } from "framer-motion";

export function RedWaveBackground() {
  // Vanishing point for 3D perspective (percentage coordinates)
  const vanishingPoint = { x: 50, y: 20 };
  
  // Generate perspective grid lines
  const generatePerspectiveLines = () => {
    const horizontalLines = [];
    const verticalLines = [];
    
    // Horizontal lines (15 lines, evenly spaced)
    for (let i = 0; i <= 15; i++) {
      const y = 20 + (i * 5.5); // Start at 20% from top, space 5.5% apart
      horizontalLines.push({
        x1: 0,
        y1: y,
        x2: 100,
        y2: y,
      });
    }
    
    // Vertical lines (22 lines, converging to vanishing point)
    for (let i = 0; i <= 22; i++) {
      const baseX = (i / 22) * 100; // Evenly distributed along bottom
      verticalLines.push({
        x1: baseX,
        y1: 100,
        x2: vanishingPoint.x,
        y2: vanishingPoint.y,
      });
    }
    
    return { horizontalLines, verticalLines };
  };
  
  const { horizontalLines, verticalLines } = generatePerspectiveLines();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background - white to light gray */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-neutral-50" />
      
      {/* Animated grid container */}
      <motion.div
        className="absolute inset-0"
        animate={{
          y: [-20, 20, -20],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <defs>
            {/* Gradient for fading grid lines */}
            <linearGradient id="gridFadeHorizontal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(200, 200, 200, 0)" />
              <stop offset="10%" stopColor="rgba(200, 200, 200, 0.12)" />
              <stop offset="90%" stopColor="rgba(200, 200, 200, 0.12)" />
              <stop offset="100%" stopColor="rgba(200, 200, 200, 0)" />
            </linearGradient>
            <linearGradient id="gridFadeVertical" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(200, 200, 200, 0.15)" />
              <stop offset="50%" stopColor="rgba(200, 200, 200, 0.08)" />
              <stop offset="100%" stopColor="rgba(200, 200, 200, 0)" />
            </linearGradient>
          </defs>
          
          {/* Horizontal lines */}
          {horizontalLines.map((line, i) => (
            <line
              key={`h-${i}`}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke="url(#gridFadeHorizontal)"
              strokeWidth="0.08"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          
          {/* Vertical lines (perspective lines) */}
          {verticalLines.map((line, i) => (
            <line
              key={`v-${i}`}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke="url(#gridFadeVertical)"
              strokeWidth="0.08"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </motion.div>
      
      {/* Subtle vignette at edges */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.03) 100%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Grain texture overlay for richness */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
