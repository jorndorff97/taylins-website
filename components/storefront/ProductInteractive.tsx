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

  // Desktop display - show even at 0, use MOQ as default
  const displayPairs = totalPairs > 0 ? totalPairs : listing.moq;

  return (
    <>
      {/* Desktop-only SavingsGauge - shows at quantity=0 using MOQ */}
      {listing.stockXPrice && pricePerPair && (
        <div className="fixed bottom-4 left-4 z-10 hidden w-[calc(50%-2rem)] max-w-md md:block lg:left-8">
          <SavingsGauge
            yourPrice={pricePerPair}
            stockXPrice={Number(listing.stockXPrice)}
            totalPairs={displayPairs}
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
