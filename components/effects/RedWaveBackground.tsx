"use client";

import { motion } from "framer-motion";

export function RedWaveBackground() {
  // God ray configurations - 3 dramatic wide-spreading beams
  const rays = [
    {
      id: 'ray-1',
      // Wide beam at 20% position
      topLeft: { x: 18, y: 0 },
      topRight: { x: 22, y: 0 },
      bottomLeft: { x: 10, y: 100 },
      bottomRight: { x: 30, y: 100 },
      gradientId: 'rayGradient1',
    },
    {
      id: 'ray-2',
      // Wide beam at 45% position
      topLeft: { x: 43, y: 0 },
      topRight: { x: 47, y: 0 },
      bottomLeft: { x: 30, y: 100 },
      bottomRight: { x: 60, y: 100 },
      gradientId: 'rayGradient2',
    },
    {
      id: 'ray-3',
      // Wide beam at 72% position
      topLeft: { x: 70, y: 0 },
      topRight: { x: 74, y: 0 },
      bottomLeft: { x: 58, y: 100 },
      bottomRight: { x: 86, y: 100 },
      gradientId: 'rayGradient3',
    },
  ];

  // Cloud cluster configurations - 5 clusters with layered ellipses
  const cloudClusters = [
    {
      id: 'cluster-1',
      baseX: -2,
      baseY: -8,
      layers: [
        // Shadow layer
        { rx: 18, ry: 8, offsetX: 0, offsetY: 1, fill: '#B0C4DE', opacity: 0.6, filter: 'url(#cloudShadow)' },
        // Mid layer 1
        { rx: 20, ry: 9, offsetX: -1, offsetY: 0, fill: '#E8E8E8', opacity: 0.85, filter: 'url(#cloudTexture)' },
        // Mid layer 2
        { rx: 17, ry: 8.5, offsetX: 1, offsetY: 0.5, fill: '#F0F0F0', opacity: 0.9, filter: 'url(#softEdge)' },
        // Highlight layer
        { rx: 15, ry: 7, offsetX: 0, offsetY: -0.5, fill: '#FAFAFA', opacity: 0.95, filter: 'url(#softEdge)' },
      ],
    },
    {
      id: 'cluster-2',
      baseX: 14,
      baseY: -6,
      layers: [
        { rx: 16, ry: 7.5, offsetX: 0, offsetY: 1, fill: '#A9B8C7', opacity: 0.65, filter: 'url(#cloudShadow)' },
        { rx: 18, ry: 8.5, offsetX: -0.5, offsetY: 0, fill: '#EBEBEB', opacity: 0.87, filter: 'url(#cloudTexture)' },
        { rx: 16, ry: 8, offsetX: 0.8, offsetY: 0.3, fill: '#F5F5F5', opacity: 0.92, filter: 'url(#softEdge)' },
        { rx: 14, ry: 6.5, offsetX: -0.3, offsetY: -0.4, fill: '#FFFFFF', opacity: 0.96, filter: 'url(#softEdge)' },
      ],
    },
    {
      id: 'cluster-3',
      baseX: 32,
      baseY: -7,
      layers: [
        { rx: 19, ry: 8.5, offsetX: 0, offsetY: 1.2, fill: '#B0C4DE', opacity: 0.62, filter: 'url(#cloudShadow)' },
        { rx: 21, ry: 10, offsetX: -1, offsetY: 0, fill: '#E8E8E8', opacity: 0.88, filter: 'url(#cloudTexture)' },
        { rx: 18, ry: 9, offsetX: 1.2, offsetY: 0.5, fill: '#F0F0F0', opacity: 0.91, filter: 'url(#softEdge)' },
        { rx: 16, ry: 7.5, offsetX: 0, offsetY: -0.6, fill: '#FAFAFA', opacity: 0.97, filter: 'url(#softEdge)' },
        { rx: 13, ry: 6, offsetX: -0.5, offsetY: -1, fill: '#FFFFFF', opacity: 0.98, filter: 'url(#softEdge)' },
      ],
    },
    {
      id: 'cluster-4',
      baseX: 52,
      baseY: -6.5,
      layers: [
        { rx: 17, ry: 8, offsetX: 0, offsetY: 1, fill: '#A9B8C7', opacity: 0.64, filter: 'url(#cloudShadow)' },
        { rx: 19, ry: 9, offsetX: -0.8, offsetY: 0, fill: '#EBEBEB', opacity: 0.86, filter: 'url(#cloudTexture)' },
        { rx: 17, ry: 8.5, offsetX: 0.9, offsetY: 0.4, fill: '#F5F5F5', opacity: 0.9, filter: 'url(#softEdge)' },
        { rx: 15, ry: 7, offsetX: -0.2, offsetY: -0.5, fill: '#FFFFFF', opacity: 0.95, filter: 'url(#softEdge)' },
      ],
    },
    {
      id: 'cluster-5',
      baseX: 68,
      baseY: -7.5,
      layers: [
        { rx: 18, ry: 8.5, offsetX: 0, offsetY: 1.1, fill: '#B0C4DE', opacity: 0.63, filter: 'url(#cloudShadow)' },
        { rx: 20, ry: 9.5, offsetX: -1.2, offsetY: 0, fill: '#E8E8E8', opacity: 0.89, filter: 'url(#cloudTexture)' },
        { rx: 17, ry: 8.8, offsetX: 1, offsetY: 0.6, fill: '#F0F0F0', opacity: 0.93, filter: 'url(#softEdge)' },
        { rx: 15, ry: 7.2, offsetX: 0, offsetY: -0.4, fill: '#FAFAFA', opacity: 0.96, filter: 'url(#softEdge)' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blue sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] via-[#B0D4E3] to-[#E0F2F7]" />
      
      {/* SVG container for god rays and clouds */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          {/* Ray gradients - warm yellow to atmospheric blue */}
          <linearGradient id="rayGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF8DC" stopOpacity="0.9" />
            <stop offset="5%" stopColor="#FFEAA7" stopOpacity="0.85" />
            <stop offset="15%" stopColor="#FFD93D" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#E8F4F8" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#B0E0E6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          
          <linearGradient id="rayGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF4E0" stopOpacity="0.92" />
            <stop offset="5%" stopColor="#FFE88C" stopOpacity="0.87" />
            <stop offset="15%" stopColor="#FFD700" stopOpacity="0.72" />
            <stop offset="35%" stopColor="#E8F4F8" stopOpacity="0.42" />
            <stop offset="60%" stopColor="#B0E0E6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          
          <linearGradient id="rayGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF8DC" stopOpacity="0.88" />
            <stop offset="5%" stopColor="#FFEAA7" stopOpacity="0.83" />
            <stop offset="15%" stopColor="#FFD93D" stopOpacity="0.68" />
            <stop offset="35%" stopColor="#E8F4F8" stopOpacity="0.38" />
            <stop offset="60%" stopColor="#B0E0E6" stopOpacity="0.14" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          
          {/* Cloud filters */}
          <filter id="cloudTexture">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.015 0.025" 
              numOctaves="4" 
              seed="2"
            />
            <feDisplacementMap in="SourceGraphic" scale="15" />
            <feGaussianBlur stdDeviation="8" />
          </filter>
          
          <filter id="softEdge">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          
          <filter id="cloudShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="20" />
            <feOffset dx="0" dy="15" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="rayGlow">
            <feGaussianBlur stdDeviation="8" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>
        </defs>
        
        {/* God rays - render behind clouds */}
        {rays.map((ray) => (
          <motion.polygon
            key={ray.id}
            points={`${ray.topLeft.x},${ray.topLeft.y} ${ray.topRight.x},${ray.topRight.y} ${ray.bottomRight.x},${ray.bottomRight.y} ${ray.bottomLeft.x},${ray.bottomLeft.y}`}
            fill={`url(#${ray.gradientId})`}
            filter="url(#rayGlow)"
            style={{ mixBlendMode: 'screen' }}
            animate={{
              opacity: [0.8, 0.9, 0.8],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'loop',
            }}
          />
        ))}
        
        {/* Cloud clusters - render in front of rays */}
        {cloudClusters.map((cluster) => (
          <motion.g
            key={cluster.id}
            animate={{
              x: ['0%', '1%', '0%'],
              y: ['0%', '0.3%', '0%'],
            }}
            transition={{
              duration: 120,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'loop',
            }}
          >
            {cluster.layers.map((layer, layerIndex) => (
              <ellipse
                key={`${cluster.id}-layer-${layerIndex}`}
                cx={`${cluster.baseX + layer.offsetX}%`}
                cy={`${cluster.baseY + layer.offsetY}%`}
                rx={`${layer.rx}%`}
                ry={`${layer.ry}%`}
                fill={layer.fill}
                opacity={layer.opacity}
                filter={layer.filter}
              />
            ))}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
