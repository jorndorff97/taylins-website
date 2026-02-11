"use client";

import { motion, AnimatePresence, MotionValue } from "framer-motion";
import { useState, useEffect } from "react";

interface AnimatedGradientBackgroundProps {
  parallaxY?: MotionValue<number>;
}

// Gradient configurations that will cycle through
const GRADIENT_CONFIGS = [
  {
    id: 1,
    layers: [
      {
        gradient: 'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        position: { x: 0, y: 0 },
        scale: 1,
      },
      {
        gradient: 'radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
        position: { x: 0, y: 0 },
        scale: 1.1,
      },
      {
        gradient: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
        position: { x: 0, y: 0 },
        scale: 1.2,
      },
    ]
  },
  {
    id: 2,
    layers: [
      {
        gradient: 'radial-gradient(circle at 70% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
        position: { x: 10, y: -10 },
        scale: 1.1,
      },
      {
        gradient: 'radial-gradient(circle at 30% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)',
        position: { x: -10, y: 10 },
        scale: 1,
      },
      {
        gradient: 'radial-gradient(circle at 60% 60%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
        position: { x: 0, y: 0 },
        scale: 1.3,
      },
    ]
  },
  {
    id: 3,
    layers: [
      {
        gradient: 'radial-gradient(circle at 40% 60%, rgba(99, 102, 241, 0.18) 0%, transparent 50%)',
        position: { x: -5, y: 5 },
        scale: 1.2,
      },
      {
        gradient: 'radial-gradient(circle at 85% 40%, rgba(139, 92, 246, 0.13) 0%, transparent 50%)',
        position: { x: 5, y: -5 },
        scale: 1,
      },
      {
        gradient: 'radial-gradient(circle at 15% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
        position: { x: 0, y: 0 },
        scale: 1.1,
      },
    ]
  },
  {
    id: 4,
    layers: [
      {
        gradient: 'radial-gradient(circle at 25% 75%, rgba(139, 92, 246, 0.16) 0%, transparent 50%)',
        position: { x: 8, y: 8 },
        scale: 1,
      },
      {
        gradient: 'radial-gradient(circle at 75% 25%, rgba(99, 102, 241, 0.14) 0%, transparent 50%)',
        position: { x: -8, y: -8 },
        scale: 1.2,
      },
      {
        gradient: 'radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.09) 0%, transparent 60%)',
        position: { x: 0, y: 0 },
        scale: 1.1,
      },
    ]
  },
];

export function AnimatedGradientBackground({ parallaxY }: AnimatedGradientBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cycle through gradient configurations every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GRADIENT_CONFIGS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentConfig = GRADIENT_CONFIGS[currentIndex];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentConfig.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {currentConfig.layers.map((layer, index) => (
            <motion.div
              key={`${currentConfig.id}-${index}`}
              className="absolute inset-0 will-animate"
              style={{
                background: layer.gradient,
                y: parallaxY,
              }}
              animate={{
                x: [
                  layer.position.x,
                  layer.position.x + 30,
                  layer.position.x - 20,
                  layer.position.x
                ],
                y: [
                  layer.position.y,
                  layer.position.y - 40,
                  layer.position.y + 30,
                  layer.position.y
                ],
                scale: [
                  layer.scale,
                  layer.scale * 1.1,
                  layer.scale * 0.95,
                  layer.scale
                ],
              }}
              transition={{
                duration: 20 + index * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 2,
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Additional pulsing gradient orb for depth */}
      <motion.div
        className="absolute inset-0 will-animate"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 1) 0%, transparent 40%)',
        }}
      />

      {/* Subtle blur effect layer */}
      <motion.div
        className="absolute inset-0 will-animate"
        animate={{
          filter: ['blur(0px)', 'blur(60px)', 'blur(0px)'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
