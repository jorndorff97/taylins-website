"use client";

import { motion } from "framer-motion";

export function RedWaveBackground() {
  // Monochrome red color palette
  const colors = {
    veryLight: 'rgba(254, 226, 226',  // #fee2e2 - almost white-red
    light: 'rgba(254, 202, 202',       // #fecaca - light red
    medium: 'rgba(252, 165, 165',      // #fca5a5 - medium red
    base: 'rgba(239, 68, 68',          // #ef4444 - base red
    dark: 'rgba(220, 38, 38',          // #dc2626 - dark red
    veryDark: 'rgba(185, 28, 28',      // #b91c1c - very dark red
  };

  // Glass panel component with chromatic aberration
  const GlassPanel = ({ 
    size, 
    position, 
    color, 
    blur, 
    opacity, 
    duration, 
    delay, 
    shape,
    rotation = 0 
  }: {
    size: string;
    position: { top?: string; left?: string; right?: string; bottom?: string };
    color: string;
    blur: number;
    opacity: [number, number, number];
    duration: number;
    delay: number;
    shape: 'rounded' | 'square' | 'vertical' | 'horizontal' | 'blob';
    rotation?: number;
  }) => {
    const shapeStyles = {
      rounded: { borderRadius: '60px' },
      square: { borderRadius: '20px', transform: `rotate(${rotation}deg)` },
      vertical: { borderRadius: '80px', aspectRatio: '1/1.5' },
      horizontal: { borderRadius: '80px', aspectRatio: '1.5/1' },
      blob: { borderRadius: '45% 55% 60% 40% / 50% 60% 40% 50%' },
    };

    const baseStyle = {
      position: 'absolute' as const,
      width: size,
      height: size,
      ...position,
      background: `linear-gradient(135deg, ${color}, 0.25), ${color}, 0.08))`,
      filter: `blur(${blur}px)`,
      backdropFilter: 'blur(40px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(185, 28, 28, 0.15)',
      willChange: 'transform, opacity',
      transform: 'translate3d(0, 0, 0)',
      ...shapeStyles[shape],
    };

    return (
      <div style={{ position: 'absolute', ...position }}>
        {/* Red channel (right offset) */}
        <motion.div
          style={{
            ...baseStyle,
            mixBlendMode: 'screen',
            transform: 'translate(3px, 0)',
          }}
          animate={{
            x: [-30, 70, -30],
            y: [0, -50, 0],
            scale: [1.0, 1.1, 1.0],
            rotate: [0, 3, -3, 0],
            opacity: opacity,
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        />
        
        {/* Base channel (center) */}
        <motion.div
          style={baseStyle}
          animate={{
            x: [-30, 70, -30],
            y: [0, -50, 0],
            scale: [1.0, 1.1, 1.0],
            rotate: [0, 3, -3, 0],
            opacity: opacity,
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        />
        
        {/* Pink channel (left offset) */}
        <motion.div
          style={{
            ...baseStyle,
            mixBlendMode: 'screen',
            transform: 'translate(-3px, 0)',
            background: `linear-gradient(135deg, ${colors.medium}, 0.2), ${colors.light}, 0.06))`,
          }}
          animate={{
            x: [-30, 70, -30],
            y: [0, -50, 0],
            scale: [1.0, 1.1, 1.0],
            rotate: [0, 3, -3, 0],
            opacity: opacity,
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* LAYER 1 - Far Background (most subtle) */}
      
      {/* Far Back Panel 1 - Very Light Red */}
      <GlassPanel
        size="1400px"
        position={{ top: '5%', left: '10%' }}
        color={colors.veryLight}
        blur={60}
        opacity={[0.08, 0.12, 0.08]}
        duration={25}
        delay={0}
        shape="blob"
      />
      
      {/* Far Back Panel 2 - Light Red */}
      <GlassPanel
        size="1200px"
        position={{ top: '40%', right: '5%' }}
        color={colors.light}
        blur={60}
        opacity={[0.1, 0.12, 0.1]}
        duration={22}
        delay={8}
        shape="horizontal"
      />

      {/* LAYER 2 - Mid Background */}
      
      {/* Mid Panel 1 - Light to Medium Red */}
      <GlassPanel
        size="1000px"
        position={{ top: '15%', right: '20%' }}
        color={colors.light}
        blur={45}
        opacity={[0.12, 0.16, 0.12]}
        duration={20}
        delay={3}
        shape="rounded"
      />
      
      {/* Mid Panel 2 - Medium Red */}
      <GlassPanel
        size="900px"
        position={{ bottom: '20%', left: '15%' }}
        color={colors.medium}
        blur={45}
        opacity={[0.14, 0.18, 0.14]}
        duration={18}
        delay={10}
        shape="vertical"
      />
      
      {/* Mid Panel 3 - Base Red */}
      <GlassPanel
        size="800px"
        position={{ top: '50%', left: '45%' }}
        color={colors.base}
        blur={45}
        opacity={[0.12, 0.17, 0.12]}
        duration={19}
        delay={6}
        shape="square"
        rotation={25}
      />

      {/* LAYER 3 - Foreground Glass (most prominent) */}
      
      {/* Front Panel 1 - Base Red */}
      <GlassPanel
        size="750px"
        position={{ top: '25%', left: '25%' }}
        color={colors.base}
        blur={30}
        opacity={[0.18, 0.23, 0.18]}
        duration={17}
        delay={2}
        shape="rounded"
      />
      
      {/* Front Panel 2 - Dark Red */}
      <GlassPanel
        size="650px"
        position={{ bottom: '15%', right: '25%' }}
        color={colors.dark}
        blur={30}
        opacity={[0.2, 0.25, 0.2]}
        duration={15}
        delay={12}
        shape="blob"
      />
      
      {/* Front Panel 3 - Very Dark Red */}
      <GlassPanel
        size="600px"
        position={{ top: '60%', right: '10%' }}
        color={colors.veryDark}
        blur={30}
        opacity={[0.18, 0.22, 0.18]}
        duration={16}
        delay={7}
        shape="square"
        rotation={-15}
      />

      {/* Subtle noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
