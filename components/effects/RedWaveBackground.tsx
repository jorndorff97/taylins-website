"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function RedWaveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d4fae22e-da3c-4290-91e9-330f30caed4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RedWaveBackground.tsx:11',message:'Component mounted',data:{rendered:true},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (containerRef.current) {
      const el = containerRef.current;
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d4fae22e-da3c-4290-91e9-330f30caed4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RedWaveBackground.tsx:20',message:'Container dimensions and styles',data:{width:rect.width,height:rect.height,position:computed.position,zIndex:computed.zIndex,display:computed.display,visibility:computed.visibility,opacity:computed.opacity,top:computed.top,left:computed.left,right:computed.right,bottom:computed.bottom},timestamp:Date.now(),hypothesisId:'B,C,D,E'})}).catch(()=>{});
      // #endregion

      const firstChild = el.firstElementChild as HTMLElement;
      if (firstChild) {
        const childRect = firstChild.getBoundingClientRect();
        const childComputed = window.getComputedStyle(firstChild);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d4fae22e-da3c-4290-91e9-330f30caed4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RedWaveBackground.tsx:31',message:'First wave child styles',data:{width:childRect.width,height:childRect.height,position:childComputed.position,background:childComputed.background,filter:childComputed.filter,opacity:childComputed.opacity,display:childComputed.display,visibility:childComputed.visibility},timestamp:Date.now(),hypothesisId:'B,D,E'})}).catch(()=>{});
        // #endregion
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Large Primary Wave - Center */}
      <motion.div
        className="absolute top-[10%] left-[50%] w-[1000px] h-[1000px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, rgba(239,68,68,0.25) 40%, rgba(239,68,68,0) 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
        animate={{
          x: [-100, 150, -100],
          y: [0, -120, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary Wave - Left Side */}
      <motion.div
        className="absolute top-[30%] left-[5%] w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(248,113,113,0.5) 0%, rgba(248,113,113,0.2) 45%, rgba(248,113,113,0) 70%)',
          filter: 'blur(50px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, -80, 120, 0],
          y: [0, 100, -50, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Tertiary Wave - Right Side */}
      <motion.div
        className="absolute top-[50%] right-[10%] w-[900px] h-[900px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(220,38,38,0.45) 0%, rgba(220,38,38,0.18) 50%, rgba(220,38,38,0) 70%)',
          filter: 'blur(55px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, 100, -150, 0],
          y: [0, -80, 60, 0],
          scale: [1, 1.25, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Accent Wave - Upper Right */}
      <motion.div
        className="absolute top-[15%] right-[20%] w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(254,202,202,0.55) 0%, rgba(254,202,202,0.22) 40%, rgba(254,202,202,0) 70%)',
          filter: 'blur(45px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 90, -40, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Deep Wave - Bottom Left */}
      <motion.div
        className="absolute bottom-[10%] left-[15%] w-[850px] h-[850px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.52) 0%, rgba(239,68,68,0.22) 45%, rgba(239,68,68,0) 70%)',
          filter: 'blur(50px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, 140, -90, 0],
          y: [0, -70, 110, 0],
          scale: [1, 0.95, 1.3, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle Wave - Center Bottom */}
      <motion.div
        className="absolute bottom-[20%] left-[40%] w-[750px] h-[750px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(248,113,113,0.42) 0%, rgba(248,113,113,0.18) 50%, rgba(248,113,113,0) 70%)',
          filter: 'blur(45px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, -60, 100, 0],
          y: [0, 50, -80, 0],
          scale: [1, 1.2, 0.85, 1],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Additional Ambient Wave - Top Left */}
      <motion.div
        className="absolute top-[5%] left-[25%] w-[650px] h-[650px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(220,38,38,0.38) 0%, rgba(220,38,38,0.15) 55%, rgba(220,38,38,0) 70%)',
          filter: 'blur(48px)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, 90, -110, 0],
          y: [0, -100, 70, 0],
          scale: [1, 1.1, 1.25, 1],
        }}
        transition={{
          duration: 21,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
