"use client";

import { motion } from "framer-motion";

export function RedWaveBackground() {
  // Multi-tonal color palette
  const colors = {
    deepRed: 'rgba(185, 28, 28',
    brightRed: 'rgba(239, 68, 68',
    orange: 'rgba(249, 115, 22',
    pink: 'rgba(236, 72, 153',
    coral: 'rgba(251, 146, 60',
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* BACK LAYER - Large, slow, heavily blurred */}
      
      {/* Back Shape 1 - Deep Red Blob */}
      <motion.div
        className="absolute top-[5%] left-[10%] w-[1000px] h-[1000px]"
        style={{
          background: `radial-gradient(circle, ${colors.deepRed}, 0.4) 0%, ${colors.brightRed}, 0.25) 30%, ${colors.coral}, 0.12) 60%, transparent 100%)`,
          filter: 'blur(55px)',
          borderRadius: '40% 60% 70% 30% / 50% 60% 40% 50%',
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [0.4, 2.8, 0.4],
          rotate: [0, 360, 720],
          x: [-50, 100, -50],
          y: [0, -80, 0],
          opacity: [0.2, 0.4, 0.2],
          borderRadius: [
            '40% 60% 70% 30% / 50% 60% 40% 50%',
            '60% 40% 30% 70% / 40% 50% 60% 50%',
            '40% 60% 70% 30% / 50% 60% 40% 50%',
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0,
        }}
      />

      {/* Back Shape 2 - Orange/Pink Blend */}
      <motion.div
        className="absolute top-[40%] right-[5%] w-[1200px] h-[1200px]"
        style={{
          background: `conic-gradient(from 180deg, ${colors.orange}, 0.35) 0deg, ${colors.pink}, 0.3) 120deg, ${colors.brightRed}, 0.2) 240deg, ${colors.orange}, 0.35) 360deg)`,
          filter: 'blur(60px)',
          borderRadius: '30% 70% 60% 40% / 70% 30% 70% 30%',
          mixBlendMode: 'color-dodge',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [0.3, 3.0, 0.3],
          rotate: [0, -540, 0],
          x: [80, -60, 80],
          y: [40, -40, 40],
          opacity: [0.15, 0.38, 0.15],
          borderRadius: [
            '30% 70% 60% 40% / 70% 30% 70% 30%',
            '70% 30% 40% 60% / 30% 70% 30% 70%',
            '30% 70% 60% 40% / 70% 30% 70% 30%',
          ],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "anticipate",
          delay: 2,
        }}
      />

      {/* Back Shape 3 - Coral Wave */}
      <motion.div
        className="absolute bottom-[10%] left-[25%] w-[900px] h-[900px]"
        style={{
          background: `radial-gradient(ellipse, ${colors.coral}, 0.38) 0%, ${colors.orange}, 0.25) 35%, ${colors.pink}, 0.15) 70%, transparent 100%)`,
          filter: 'blur(52px)',
          borderRadius: '55% 45% 65% 35% / 45% 55% 45% 55%',
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [0.5, 2.5, 0.5],
          rotate: [0, 720, 1440],
          x: [-40, 70, -40],
          y: [-30, 60, -30],
          opacity: [0.18, 0.35, 0.18],
          borderRadius: [
            '55% 45% 65% 35% / 45% 55% 45% 55%',
            '45% 55% 35% 65% / 55% 45% 55% 45%',
            '55% 45% 65% 35% / 45% 55% 45% 55%',
          ],
        }}
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: "circInOut",
          delay: 4,
        }}
      />

      {/* MID LAYER - Medium size, moderate blur */}
      
      {/* Mid Shape 1 - Bright Red Chromatic */}
      <motion.div
        className="absolute top-[20%] left-[45%] w-[650px] h-[650px]"
        style={{
          background: `radial-gradient(circle, ${colors.brightRed}, 0.55) 0%, ${colors.deepRed}, 0.4) 40%, ${colors.orange}, 0.2) 75%, transparent 100%)`,
          filter: 'blur(38px)',
          borderRadius: '48% 52% 38% 62% / 62% 38% 62% 38%',
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [0.4, 3.0, 0.4],
          rotate: [0, -720, 0],
          x: [60, -90, 60],
          y: [-50, 80, -50],
          opacity: [0.3, 0.6, 0.3],
          borderRadius: [
            '48% 52% 38% 62% / 62% 38% 62% 38%',
            '52% 48% 62% 38% / 38% 62% 38% 62%',
            '48% 52% 38% 62% / 62% 38% 62% 38%',
          ],
        }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Mid Shape 2 - Pink/Orange Split */}
      <motion.div
        className="absolute top-[55%] right-[30%] w-[580px] h-[580px]"
        style={{
          background: `conic-gradient(from 90deg, ${colors.pink}, 0.5) 0deg, ${colors.coral}, 0.45) 90deg, ${colors.orange}, 0.35) 180deg, ${colors.brightRed}, 0.4) 270deg, ${colors.pink}, 0.5) 360deg)`,
          filter: 'blur(42px)',
          borderRadius: '35% 65% 58% 42% / 52% 48% 52% 48%',
          mixBlendMode: 'color-dodge',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [0.5, 2.8, 0.5],
          rotate: [0, 900, 0],
          x: [-70, 50, -70],
          y: [30, -70, 30],
          opacity: [0.35, 0.58, 0.35],
          borderRadius: [
            '35% 65% 58% 42% / 52% 48% 52% 48%',
            '65% 35% 42% 58% / 48% 52% 48% 52%',
            '35% 65% 58% 42% / 52% 48% 52% 48%',
          ],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: "anticipate",
          delay: 2.5,
        }}
      />

      {/* Mid Shape 3 - Deep Red Morph */}
      <motion.div
        className="absolute bottom-[25%] left-[15%] w-[700px] h-[700px]"
        style={{
          background: `radial-gradient(ellipse, ${colors.deepRed}, 0.48) 0%, ${colors.coral}, 0.38) 30%, ${colors.pink}, 0.22) 65%, transparent 100%)`,
          filter: 'blur(40px)',
          borderRadius: '42% 58% 70% 30% / 38% 62% 38% 62%',
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [0.35, 3.2, 0.35],
          rotate: [0, -540, -1080],
          x: [45, -85, 45],
          y: [-45, 65, -45],
          opacity: [0.32, 0.55, 0.32],
          borderRadius: [
            '42% 58% 70% 30% / 38% 62% 38% 62%',
            '58% 42% 30% 70% / 62% 38% 62% 38%',
            '42% 58% 70% 30% / 38% 62% 38% 62%',
          ],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "circInOut",
          delay: 3.2,
        }}
      />

      {/* FRONT LAYER - Small, fast, less blur */}
      
      {/* Front Shape 1 - Orange Pulse */}
      <motion.div
        className="absolute top-[35%] left-[60%] w-[500px] h-[500px]"
        style={{
          background: `radial-gradient(circle, ${colors.orange}, 0.65) 0%, ${colors.coral}, 0.5) 35%, ${colors.brightRed}, 0.28) 70%, transparent 100%)`,
          filter: 'blur(25px)',
          borderRadius: '50% 50% 45% 55% / 55% 45% 55% 45%',
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [0.4, 3.0, 0.4],
          rotate: [0, 720, 1440],
          x: [-55, 95, -55],
          y: [50, -85, 50],
          opacity: [0.4, 0.7, 0.4],
          borderRadius: [
            '50% 50% 45% 55% / 55% 45% 55% 45%',
            '50% 50% 55% 45% / 45% 55% 45% 55%',
            '50% 50% 45% 55% / 55% 45% 55% 45%',
          ],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Front Shape 2 - Pink Burst */}
      <motion.div
        className="absolute top-[65%] right-[15%] w-[450px] h-[450px]"
        style={{
          background: `conic-gradient(from 45deg, ${colors.pink}, 0.6) 0deg, ${colors.brightRed}, 0.55) 120deg, ${colors.coral}, 0.45) 240deg, ${colors.pink}, 0.6) 360deg)`,
          filter: 'blur(28px)',
          borderRadius: '38% 62% 52% 48% / 48% 52% 48% 52%',
          mixBlendMode: 'color-dodge',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [0.5, 2.9, 0.5],
          rotate: [0, -900, 0],
          x: [70, -60, 70],
          y: [-40, 75, -40],
          opacity: [0.45, 0.68, 0.45],
          borderRadius: [
            '38% 62% 52% 48% / 48% 52% 48% 52%',
            '62% 38% 48% 52% / 52% 48% 52% 48%',
            '38% 62% 52% 48% / 48% 52% 48% 52%',
          ],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "anticipate",
          delay: 1.8,
        }}
      />

      {/* Front Shape 3 - Coral Glitch */}
      <motion.div
        className="absolute top-[12%] right-[40%] w-[520px] h-[520px]"
        style={{
          background: `radial-gradient(ellipse, ${colors.coral}, 0.58) 0%, ${colors.orange}, 0.48) 30%, ${colors.deepRed}, 0.3) 65%, transparent 100%)`,
          filter: 'blur(22px)',
          borderRadius: '45% 55% 60% 40% / 42% 58% 42% 58%',
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [0.3, 3.1, 0.3],
          rotate: [0, 540, 1080],
          x: [-65, 85, -65],
          y: [35, -70, 35],
          opacity: [0.42, 0.65, 0.42],
          borderRadius: [
            '45% 55% 60% 40% / 42% 58% 42% 58%',
            '55% 45% 40% 60% / 58% 42% 58% 42%',
            '45% 55% 60% 40% / 42% 58% 42% 58%',
          ],
        }}
        transition={{
          duration: 3.0,
          repeat: Infinity,
          ease: "circInOut",
          delay: 4.5,
        }}
      />
    </div>
  );
}
