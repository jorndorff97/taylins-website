"use client";

import { motion } from "framer-motion";

const brands = [
  {
    name: "Nike",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M2.5 18.5L23.5 9.5L22 8L2 16L2.5 18.5Z"/>
      </svg>
    ),
  },
  {
    name: "Adidas",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M4 18L8 10L12 18H4Z"/>
        <path d="M8 8L12 16L16 8L12 0L8 8Z"/>
        <path d="M12 18L16 10L20 18H12Z"/>
      </svg>
    ),
  },
  {
    name: "Jordan",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C10 4 8 8 10 12C11 10 13 9 15 10C14 13 10 15 8 14C6 13 5 10 6 7C7 4 10 2 12 2Z"/>
        <circle cx="16" cy="8" r="2"/>
      </svg>
    ),
  },
  {
    name: "Puma",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18 6C16 6 14 8 12 10C10 8 8 6 6 6C4 6 2 8 2 10C2 14 6 18 12 22C18 18 22 14 22 10C22 8 20 6 18 6Z"/>
      </svg>
    ),
  },
  {
    name: "New Balance",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <text x="3" y="18" fontSize="14" fontWeight="bold" fontFamily="Arial">N</text>
      </svg>
    ),
  },
  {
    name: "Converse",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2L15 10L23 10L17 15L19 23L12 18L5 23L7 15L1 10L9 10Z"/>
      </svg>
    ),
  },
  {
    name: "Vans",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M2 6L6 18H8L12 6H10L8 14L6 6H2Z"/>
        <path d="M14 6L12 18H14L14.5 14H17L17.5 18H19L17 6H14Z"/>
      </svg>
    ),
  },
  {
    name: "Reebok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M4 8L8 6V14L4 12V8Z"/>
        <path d="M10 6L14 8V12L10 14V6Z"/>
        <path d="M16 8L20 6V14L16 12V8Z"/>
      </svg>
    ),
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
