"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function RedWaveBackground() {
  // Light beam configurations - Realistic god rays/crepuscular rays
  const beams = [
    {
      // Beam 1 - Far left
      position: { top: '0px', left: '8%' },
      size: { width: '140px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(255,250,235,0.75) 0%, rgba(173,216,230,0.4) 20%, rgba(135,206,235,0.2) 45%, rgba(135,206,250,0.08) 70%, transparent 100%)',
      rotation: 8,
      animation: {
        opacity: [0.6, 0.75, 0.6],
      },
      duration: 8,
      baseOpacity: 0.65,
    },
    {
      // Beam 2 - Left-center
      position: { top: '0px', left: '22%' },
      size: { width: '160px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(255,248,220,0.8) 0%, rgba(173,216,230,0.45) 18%, rgba(135,206,235,0.22) 40%, rgba(135,206,250,0.1) 65%, transparent 100%)',
      rotation: -6,
      animation: {
        opacity: [0.65, 0.8, 0.65],
      },
      duration: 10,
      baseOpacity: 0.7,
    },
    {
      // Beam 3 - Center-left
      position: { top: '0px', left: '38%' },
      size: { width: '150px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(255,255,240,0.85) 0%, rgba(173,216,230,0.5) 15%, rgba(135,206,235,0.25) 38%, rgba(135,206,250,0.12) 60%, transparent 100%)',
      rotation: 10,
      animation: {
        opacity: [0.7, 0.85, 0.7],
      },
      duration: 7,
      baseOpacity: 0.75,
    },
    {
      // Beam 4 - Center-right
      position: { top: '0px', left: '54%' },
      size: { width: '170px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(255,252,230,0.8) 0%, rgba(173,216,230,0.48) 17%, rgba(135,206,235,0.24) 42%, rgba(135,206,250,0.1) 68%, transparent 100%)',
      rotation: -8,
      animation: {
        opacity: [0.65, 0.78, 0.65],
      },
      duration: 9,
      baseOpacity: 0.7,
    },
    {
      // Beam 5 - Right-center
      position: { top: '0px', left: '70%' },
      size: { width: '155px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(255,250,240,0.75) 0%, rgba(173,216,230,0.42) 20%, rgba(135,206,235,0.2) 45%, rgba(135,206,250,0.09) 70%, transparent 100%)',
      rotation: 7,
      animation: {
        opacity: [0.62, 0.75, 0.62],
      },
      duration: 11,
      baseOpacity: 0.68,
    },
    {
      // Beam 6 - Far right
      position: { top: '0px', left: '85%' },
      size: { width: '145px', height: '100vh' },
      gradient: 'linear-gradient(to bottom, rgba(255,248,225,0.72) 0%, rgba(173,216,230,0.38) 22%, rgba(135,206,235,0.18) 48%, rgba(135,206,250,0.08) 72%, transparent 100%)',
      rotation: -9,
      animation: {
        opacity: [0.6, 0.72, 0.6],
      },
      duration: 8.5,
      baseOpacity: 0.65,
    },
  ];

  // Cloud image configurations - Real cloud photos positioned at top
  const clouds = [
    {
      // Cloud 1 - Left side (fluffy white clouds)
      src: '/images/background/cloud-1.png',
      position: { top: '-100px', left: '-5%' },
      size: { width: '900px', height: 'auto' },
      animation: {
        x: ['0%', '1.5%', '0%'],
        y: ['0%', '0.5%', '0%'],
      },
      duration: 90,
      opacity: 0.95,
    },
    {
      // Cloud 2 - Center (dramatic god rays)
      src: '/images/background/cloud-2.png',
      position: { top: '-80px', left: '25%' },
      size: { width: '950px', height: 'auto' },
      animation: {
        x: ['0%', '1.8%', '0%'],
        y: ['0%', '0.7%', '0%'],
      },
      duration: 85,
      opacity: 1,
    },
    {
      // Cloud 3 - Right side (stormy dramatic)
      src: '/images/background/cloud-3.png',
      position: { top: '-90px', left: '55%' },
      size: { width: '920px', height: 'auto' },
      animation: {
        x: ['0%', '1.3%', '0%'],
        y: ['0%', '0.6%', '0%'],
      },
      duration: 95,
      opacity: 0.97,
    },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Realistic blue sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] via-[#B0D4E3] to-[#E0F2F7]" />
      
      {/* Light beams - render first (behind clouds) with realistic god ray effect */}
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
            filter: 'blur(2px)',
            opacity: beam.baseOpacity,
            mixBlendMode: 'screen',
            willChange: 'opacity',
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
      
      {/* Real cloud photos - render last (in front of beams) */}
      {clouds.map((cloud, index) => (
        <motion.div
          key={`cloud-${index}`}
          className="absolute"
          style={{
            width: cloud.size.width,
            height: cloud.size.height,
            top: cloud.position.top,
            left: cloud.position.left,
            opacity: cloud.opacity,
            willChange: 'transform',
          }}
          animate={cloud.animation}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'loop',
          }}
        >
          <Image
            src={cloud.src}
            alt=""
            width={1920}
            height={1080}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
            }}
            priority
          />
        </motion.div>
      ))}
    </div>
  );
}
