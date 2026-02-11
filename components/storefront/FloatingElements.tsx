"use client";

import { motion } from "framer-motion";

const PARTICLES = [
  { x: '10%', y: '20%', size: 8, delay: 0, duration: 15 },
  { x: '85%', y: '15%', size: 6, delay: 3, duration: 18 },
  { x: '25%', y: '70%', size: 10, delay: 6, duration: 20 },
  { x: '75%', y: '60%', size: 7, delay: 2, duration: 16 },
  { x: '50%', y: '40%', size: 5, delay: 8, duration: 22 },
  { x: '90%', y: '80%', size: 9, delay: 4, duration: 17 },
  { x: '15%', y: '85%', size: 6, delay: 7, duration: 19 },
  { x: '60%', y: '25%', size: 8, delay: 1, duration: 21 },
];

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            y: [0, -120, 0],
            opacity: [0, 0.25, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        >
          <div 
            className="rounded-full bg-hero-accent/20 will-animate"
            style={{
              width: particle.size,
              height: particle.size,
            }}
          />
        </motion.div>
      ))}

      {/* Add a few squares for variety */}
      <motion.div
        className="absolute"
        style={{ left: '40%', top: '55%' }}
        animate={{
          y: [0, -100, 0],
          rotate: [0, 180, 360],
          opacity: [0, 0.2, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      >
        <div className="h-3 w-3 bg-hero-secondary/15 will-animate" />
      </motion.div>

      <motion.div
        className="absolute"
        style={{ left: '70%', top: '45%' }}
        animate={{
          y: [0, -90, 0],
          rotate: [0, -180, -360],
          opacity: [0, 0.18, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 9,
        }}
      >
        <div className="h-4 w-4 rounded-sm bg-hero-accent/12 will-animate" />
      </motion.div>
    </div>
  );
}
