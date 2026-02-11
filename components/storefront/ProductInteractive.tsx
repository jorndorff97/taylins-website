"use client";

import { useState, useEffect } from "react";
import type { Listing, ListingSize, ListingTierPrice } from "@prisma/client";
import { ListingActions } from "./ListingActions";
import { SavingsGauge } from "./SavingsGauge";

interface ProductInteractiveProps {
  listing: Listing & {
    sizes: ListingSize[];
    tierPrices: ListingTierPrice[];
  };
  startingPricePerPair: number;
}

export function ProductInteractive({ listing, startingPricePerPair }: ProductInteractiveProps) {
  const [totalPairs, setTotalPairs] = useState(0);
  const [pricePerPair, setPricePerPair] = useState<number | null>(startingPricePerPair);

  return (
    <>
      {/* Desktop-only SavingsGauge - positioned below image via parent layout */}
      {listing.stockXPrice && totalPairs > 0 && pricePerPair && (
        <div className="fixed bottom-4 left-4 z-10 hidden w-[calc(50%-2rem)] max-w-md md:block lg:left-8">
          <SavingsGauge
            yourPrice={pricePerPair}
            stockXPrice={Number(listing.stockXPrice)}
            totalPairs={totalPairs}
          />
        </div>
      )}
      
      {/* ListingActions with state callbacks */}
      <ListingActions 
        listing={listing}
        onQuantityChange={setTotalPairs}
        onPriceChange={setPricePerPair}
      />
    </>
  );
}
