"use client";

import { motion } from "framer-motion";

const brands = [
  {
    name: "Nike",
    svg: (
      <svg viewBox="0 0 50 20" fill="currentColor" className="w-12 h-8">
        <path d="M49.3 8.4c-1.6.7-3.2 1.3-4.8 1.9-3.1 1.2-6.3 2.3-9.4 3.5-2.5.9-4.9 1.9-7.4 2.8-.9.3-1.7.7-2.6 1-.3.1-.7.2-1 .3-.2 0-.3 0-.5-.1-2-1.2-4-2.3-6-3.5-2.7-1.6-5.4-3.1-8.1-4.7-.9-.5-1.8-1-2.7-1.6-.2-.1-.3-.2-.5-.3L0 4.8l.1-.1c.3.1.5.3.8.4 1.9 1.1 3.8 2.2 5.7 3.3 2.4 1.4 4.8 2.8 7.2 4.2.2.1.3.2.5.3.1-.2.3-.3.4-.4.8-.6 1.6-1.1 2.3-1.7 2.2-1.7 4.4-3.3 6.6-5 1.6-1.2 3.2-2.5 4.8-3.7.7-.5 1.4-1.1 2.1-1.6.2-.1.3-.3.5-.4h.2c1.8.5 3.7 1 5.5 1.5 2.1.6 4.2 1.2 6.3 1.8 1.6.4 3.3.9 4.9 1.4.3.1.5.2.8.3.2.1.3.2.3.4v.2c-.1.1-.1.2-.2.3-.5.3-1 .5-1.4.7z"/>
      </svg>
    ),
  },
  {
    name: "Adidas",
    svg: (
      <svg viewBox="0 0 50 20" fill="currentColor" className="w-12 h-8">
        <path d="M15.6 13.2l-3.8-6.6L7.3 13.2h8.3zm4.2 2.4H5.2L0 8.4l2.3-1.3 6.6 11.4h11.2l-3.4 2h3.1zm2.7-4.8l-3.8-6.6-4.5 6.6h8.3zm6.9 4.8H15.1l-4.3-7.3 2.3-1.3 10.3 17.9h6.2l-10.5-18.2 2.3-1.3 12.8 22.2h-5.4l-3.1-5.4zm15.1 0l-4.3-7.3-4.5 7.3h8.8zm2.7 4.8H33.2L18.5 0l2.3-1.3 26.4 45.8z"/>
      </svg>
    ),
  },
  {
    name: "Jordan",
    svg: (
      <svg viewBox="0 0 50 50" fill="currentColor" className="w-10 h-10">
        <path d="M25.5 17.5c-1.1-2.2-2.7-4.1-4.7-5.6-1.4-1-3-1.7-4.7-2-.4-.1-.7 0-.9.3-.3.5-.1 1 .4 1.2 1.3.5 2.5 1.2 3.5 2.1 1.6 1.4 2.8 3.1 3.5 5 .2.5.7.7 1.2.5.4-.2.6-.6.5-1-.3-.9-.5-1.7-.8-2.5-.1-.3-.1-.7 0-1 0 0 2.3-.1 2.3-.1s-1.3 6.5-5.2 7.8c0 0 1.5 1.2 4.8 1.2 0 0-1.8 3.5-8.3 3.5-6.5 0-11.8-5.3-11.8-11.8S10.5 3.2 17 3.2c5.2 0 9.5 3.4 11 8.1.2.7.8 1.1 1.5 1 .6-.1 1-.7.9-1.3C28.7 4.5 23.3 0 17 0 7.6 0 0 7.6 0 17s7.6 17 17 17 17-7.6 17-17c0-4.8-2-9.1-5.2-12.2-.5-.5-1.3-.5-1.8 0-.5.5-.5 1.3 0 1.8 2.7 2.7 4.4 6.4 4.4 10.4 0 3.7-1.3 7-3.5 9.6-.4.5-.4 1.2 0 1.7.5.4 1.2.4 1.7 0 2.6-3 4.2-6.9 4.2-11.3 0-4.8-2-9.1-5.2-12.2-.5-.5-1.3-.5-1.8 0-.5.5-.5 1.3 0 1.8 2.7 2.7 4.4 6.4 4.4 10.4 0 .9-.1 1.7-.3 2.6z"/>
      </svg>
    ),
  },
  {
    name: "Puma",
    svg: (
      <svg viewBox="0 0 50 20" fill="currentColor" className="w-12 h-8">
        <path d="M48.3 5.2c-.9-.2-1.8-.3-2.7-.3-2.9 0-5.6 1.2-7.6 3.2-1.5 1.5-2.5 3.4-2.9 5.4-.1.5-.1 1-.1 1.5 0 .3.1.5.3.7.2.2.4.3.7.3h.2c.4-.1.7-.4.7-.8.1-.4.1-.8.2-1.2.4-1.7 1.2-3.2 2.4-4.4 1.7-1.7 3.9-2.6 6.3-2.6.7 0 1.4.1 2.1.2.4.1.8-.2.9-.6.1-.4-.2-.8-.6-.9-.3-.2-.6-.3-.9-.5zm-15.5 9.3c-.4-.2-.9 0-1.1.4-.6 1.2-1.6 2.2-2.8 2.8-.9.5-1.9.7-2.9.7-.8 0-1.5-.1-2.3-.4-1.3-.4-2.4-1.2-3.2-2.3-.6-.8-1-1.7-1.2-2.7-.1-.5-.2-1-.2-1.5 0-.3-.2-.5-.4-.7-.2-.1-.5-.1-.7 0-.3.1-.5.4-.5.7 0 .6.1 1.2.2 1.8.3 1.3.8 2.5 1.6 3.5 1 1.4 2.5 2.5 4.2 3 1 .3 2 .5 3 .5 1.2 0 2.5-.2 3.6-.7 1.6-.7 2.9-1.9 3.7-3.4.3-.5.1-1.1-.4-1.4-.3-.2-.6-.2-.9-.3zM15.3 8.5c-.3-.1-.6 0-.8.2-.2.2-.3.5-.2.8.2.8.5 1.6 1 2.3.7 1 1.6 1.8 2.8 2.3.8.3 1.6.5 2.4.5.7 0 1.4-.1 2-.3.9-.3 1.7-.8 2.3-1.5.4-.4.7-.9.9-1.4.2-.4 0-.9-.4-1.1-.4-.2-.9 0-1.1.4-.3.6-.7 1.1-1.3 1.5-.7.5-1.6.7-2.4.7-.6 0-1.2-.1-1.8-.4-.9-.3-1.6-.9-2.1-1.7-.3-.5-.5-1-.6-1.6-.1-.4-.4-.6-.7-.7zM8.2 6.8c-.4-.1-.8.1-.9.5-.1.4.1.8.5.9.5.1 1 .3 1.4.6.6.4 1.1 1 1.4 1.6.2.4.3.8.4 1.2.1.4.4.6.8.6h.1c.4-.1.7-.5.6-.9-.1-.6-.3-1.1-.5-1.7-.4-.8-1-1.5-1.8-2-.6-.4-1.3-.7-2-.8z"/>
      </svg>
    ),
  },
  {
    name: "New Balance",
    svg: (
      <svg viewBox="0 0 50 20" fill="currentColor" className="w-12 h-8">
        <text x="5" y="15" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">NB</text>
      </svg>
    ),
  },
  {
    name: "Converse",
    svg: (
      <svg viewBox="0 0 50 50" fill="currentColor" className="w-10 h-10">
        <path d="M25 2l6.5 20h21l-17 12.3 6.5 20L25 42 7.9 54.3l6.5-20L-3 22h21z"/>
      </svg>
    ),
  },
  {
    name: "Vans",
    svg: (
      <svg viewBox="0 0 50 20" fill="currentColor" className="w-12 h-8">
        <path d="M2 4l4 12h3L13 4h-3l-2.5 8L5 4H2zm15 0l-3 12h3l.8-3h3.4l.8 3h3l-3-12h-5zm.5 3h1l1 4h-3l1-4zm8.5-3v12h3V10h3l1.5 6h3L35 10c1-.5 1.5-1.5 1.5-2.5 0-1.7-1.3-3-3-3h-7zm3 2.5h3.5c.3 0 .5.2.5.5s-.2.5-.5.5H29V6.5zm12-2.5l-2 7.5L36 4h-3l4 12h4l4-12h-3z"/>
      </svg>
    ),
  },
  {
    name: "Reebok",
    svg: (
      <svg viewBox="0 0 50 20" fill="currentColor" className="w-12 h-8">
        <path d="M5 8l8-4v12L5 12V8zm10-4l8 4v4l-8 4V4zm10 4l8-4v4l-8 4V8zm10-4l8 4v4l-8 4V4z"/>
      </svg>
    ),
  },
];

export function BrandCarousel() {
  // Duplicate brands for infinite loop effect
  const allBrands = [...brands, ...brands];

  return (
    <div className="relative h-full min-h-[300px] overflow-hidden">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />
      
      {/* Scrolling container */}
      <div className="flex flex-col gap-4 animate-scroll-vertical hover:pause py-4">
        {allBrands.map((brand, index) => (
          <motion.div
            key={`${brand.name}-${index}`}
            whileHover={{ scale: 1.05, x: 5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center bg-white/60 backdrop-blur-sm border border-neutral-200/50 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-neutral-300/50 transition-all will-animate"
          >
            <div className="text-neutral-700 hover:text-neutral-900 transition-colors">
              {brand.svg}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
