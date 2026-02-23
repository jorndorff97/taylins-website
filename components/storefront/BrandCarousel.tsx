"use client";

import { SiNike, SiAdidas, SiJordan, SiPuma, SiNewbalance, SiReebok } from 'react-icons/si';

const brands = [
  { name: "Nike", icon: <SiNike className="w-5 h-5" /> },
  { name: "Adidas", icon: <SiAdidas className="w-5 h-5" /> },
  { name: "Jordan", icon: <SiJordan className="w-5 h-5" /> },
  { name: "Puma", icon: <SiPuma className="w-5 h-5" /> },
  { name: "New Balance", icon: <SiNewbalance className="w-5 h-5" /> },
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
  { name: "Reebok", icon: <SiReebok className="w-5 h-5" /> },
];

function BrandItem({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0 px-4">
      <div className="text-neutral-700">{icon}</div>
      <span className="text-sm font-medium text-neutral-800 whitespace-nowrap">{name}</span>
    </div>
  );
}

export function BrandCarousel() {
  return (
    <div className="relative w-full h-16 overflow-hidden flex items-center">
      <div className="flex animate-marquee">
        {/* First set */}
        <div className="flex shrink-0">
          {brands.map((brand, i) => (
            <BrandItem key={`a-${i}`} name={brand.name} icon={brand.icon} />
          ))}
        </div>
        {/* Second set (duplicate for seamless loop) */}
        <div className="flex shrink-0">
          {brands.map((brand, i) => (
            <BrandItem key={`b-${i}`} name={brand.name} icon={brand.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}
