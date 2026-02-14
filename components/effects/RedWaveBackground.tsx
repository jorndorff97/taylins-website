"use client";

import { motion } from "framer-motion";

export function RedWaveBackground() {
  // Light beam configurations - Diagonal beams shining through clouds
  const beams = [
    {
      // Beam 1 - Far left
      position: { top: '20px', left: '10%' },
      size: { width: '120px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(220,38,38,0.7) 0%, rgba(239,68,68,0.5) 30%, rgba(220,38,38,0.2) 60%, transparent 100%)',
      rotation: 12,
      animation: {
        rotate: ['12deg', '14deg', '12deg'],
        opacity: [0.65, 0.75, 0.65],
      },
      duration: 25,
      baseOpacity: 0.7,
    },
    {
      // Beam 2 - Left-center
      position: { top: '40px', left: '25%' },
      size: { width: '100px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(239,68,68,0.65) 0%, rgba(220,38,38,0.45) 30%, rgba(185,28,28,0.25) 60%, transparent 100%)',
      rotation: -10,
      animation: {
        rotate: ['-10deg', '-8deg', '-10deg'],
        opacity: [0.6, 0.7, 0.6],
      },
      duration: 30,
      baseOpacity: 0.65,
    },
    {
      // Beam 3 - Center-left
      position: { top: '10px', left: '42%' },
      size: { width: '110px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(220,38,38,0.75) 0%, rgba(239,68,68,0.55) 30%, rgba(220,38,38,0.25) 60%, transparent 100%)',
      rotation: 13,
      animation: {
        rotate: ['13deg', '15deg', '13deg'],
        opacity: [0.7, 0.8, 0.7],
      },
      duration: 22,
      baseOpacity: 0.75,
    },
    {
      // Beam 4 - Center-right
      position: { top: '50px', left: '58%' },
      size: { width: '95px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(239,68,68,0.7) 0%, rgba(220,38,38,0.5) 30%, rgba(185,28,28,0.2) 60%, transparent 100%)',
      rotation: -11,
      animation: {
        rotate: ['-11deg', '-9deg', '-11deg'],
        opacity: [0.65, 0.75, 0.65],
      },
      duration: 28,
      baseOpacity: 0.7,
    },
    {
      // Beam 5 - Right-center
      position: { top: '30px', left: '75%' },
      size: { width: '115px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(220,38,38,0.72) 0%, rgba(239,68,68,0.52) 30%, rgba(220,38,38,0.22) 60%, transparent 100%)',
      rotation: 14,
      animation: {
        rotate: ['14deg', '16deg', '14deg'],
        opacity: [0.68, 0.78, 0.68],
      },
      duration: 24,
      baseOpacity: 0.72,
    },
    {
      // Beam 6 - Far right
      position: { top: '60px', left: '88%' },
      size: { width: '105px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(239,68,68,0.68) 0%, rgba(220,38,38,0.48) 30%, rgba(185,28,28,0.2) 60%, transparent 100%)',
      rotation: -12,
      animation: {
        rotate: ['-12deg', '-10deg', '-12deg'],
        opacity: [0.63, 0.73, 0.63],
      },
      duration: 27,
      baseOpacity: 0.68,
    },
  ];

  // Cloud configurations - Fluffy white clouds at top
  const clouds = [
    {
      // Cloud 1 - Large left cloud
      position: { top: '-50px', left: '-5%' },
      size: { width: '600px', height: '250px' },
      gradient: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(240,240,240,0.98) 50%, rgba(220,220,220,0.85) 100%)',
      borderRadius: '60% 40% 55% 45% / 45% 60% 40% 55%',
      animation: {
        x: ['0%', '3%', '0%'],
        scale: [1, 1.01, 1],
      },
      duration: 75,
      opacity: 0.95,
    },
    {
      // Cloud 2 - Medium center-left cloud
      position: { top: '-20px', left: '20%' },
      size: { width: '500px', height: '200px' },
      gradient: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(245,245,245,0.96) 50%, rgba(225,225,225,0.88) 100%)',
      borderRadius: '55% 45% 50% 50% / 50% 55% 45% 50%',
      animation: {
        x: ['0%', '4%', '0%'],
        scale: [1, 1.015, 1],
      },
      duration: 82,
      opacity: 0.98,
    },
    {
      // Cloud 3 - Large center cloud
      position: { top: '-40px', left: '42%' },
      size: { width: '650px', height: '280px' },
      gradient: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(242,242,242,0.97) 50%, rgba(222,222,222,0.87) 100%)',
      borderRadius: '58% 42% 52% 48% / 48% 58% 42% 52%',
      animation: {
        x: ['0%', '2.5%', '0%'],
        scale: [1, 1.012, 1],
      },
      duration: 70,
      opacity: 1,
    },
    {
      // Cloud 4 - Medium right cloud
      position: { top: '-30px', left: '68%' },
      size: { width: '550px', height: '220px' },
      gradient: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(243,243,243,0.96) 50%, rgba(223,223,223,0.86) 100%)',
      borderRadius: '62% 38% 48% 52% / 52% 62% 38% 48%',
      animation: {
        x: ['0%', '3.5%', '0%'],
        scale: [1, 1.018, 1],
      },
      duration: 78,
      opacity: 0.96,
    },
    {
      // Cloud 5 - Small far right cloud
      position: { top: '-15px', left: '85%' },
      size: { width: '480px', height: '190px' },
      gradient: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(244,244,244,0.95) 50%, rgba(224,224,224,0.84) 100%)',
      borderRadius: '57% 43% 53% 47% / 47% 57% 43% 53%',
      animation: {
        x: ['0%', '4.5%', '0%'],
        scale: [1, 1.02, 1],
      },
      duration: 85,
      opacity: 0.94,
    },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base white background */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Light beams - render first (behind clouds) */}
      {beams.map((beam, index) => (
        <motion.div
          key={`beam-${index}`}
          className="absolute"
          style={{
            width: beam.size.width,
            height: beam.size.height,
            top: beam.position.top,
            left: beam.position.left,
            background: beam.gradient,
            transform: `rotate(${beam.rotation}deg)`,
            transformOrigin: 'top center',
            filter: 'blur(1px)',
            opacity: beam.baseOpacity,
            willChange: 'transform, opacity',
          }}
          animate={beam.animation}
          transition={{
            duration: beam.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'loop',
          }}
        />
      ))}
      
      {/* Clouds - render last (in front of beams) */}
      {clouds.map((cloud, index) => (
        <motion.div
          key={`cloud-${index}`}
          className="absolute"
          style={{
            width: cloud.size.width,
            height: cloud.size.height,
            top: cloud.position.top,
            left: cloud.position.left,
            background: cloud.gradient,
            borderRadius: cloud.borderRadius,
            opacity: cloud.opacity,
            filter: 'blur(2px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            willChange: 'transform',
          }}
          animate={cloud.animation}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'loop',
          }}
        />
      ))}
    </div>
  );
}
