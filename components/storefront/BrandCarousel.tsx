"use client";

import { motion } from "framer-motion";
import { SiNike, SiAdidas, SiJordan, SiPuma, SiNewbalance, SiReebok } from 'react-icons/si';

const brands = [
  {
    name: "Nike",
    icon: <SiNike className="w-5 h-5" />,
  },
  {
    name: "Adidas",
    icon: <SiAdidas className="w-5 h-5" />,
  },
  {
    name: "Jordan",
    icon: <SiJordan className="w-5 h-5" />,
  },
  {
    name: "Puma",
    icon: <SiPuma className="w-5 h-5" />,
  },
  {
    name: "New Balance",
    icon: <SiNewbalance className="w-5 h-5" />,
  },
  {
    name: "Converse",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M8 8 L16 16 M8 12 L12 12 M12 8 L12 16"/>
      </svg>
    ),
  },
  {
    name: "Vans",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 font-bold">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fontWeight="900" fontFamily="Arial, sans-serif">V</text>
      </svg>
    ),
  },
  {
    name: "Reebok",
    icon: <SiReebok className="w-5 h-5" />,
  },
];

export function BrandCarousel() {
  // Duplicate brands for infinite loop effect
  const allBrands = [...brands, ...brands];

  return (
    <div className="relative w-full h-24 overflow-hidden">
      {/* Scrolling container */}
      <div className="flex flex-row gap-4 animate-scroll-horizontal py-3">
        {allBrands.map((brand, index) => (
          <motion.div
            key={`${brand.name}-${index}`}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 backdrop-blur-sm border border-neutral-200/50 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-neutral-300/50 transition-all will-animate flex-shrink-0"
            style={{ width: "160px" }}
          >
            <div className="text-neutral-700 hover:text-neutral-900 transition-colors">
              {brand.icon}
            </div>
            <span className="text-sm font-medium text-neutral-800">
              {brand.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
