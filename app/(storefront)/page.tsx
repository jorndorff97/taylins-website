import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STOREFRONT_CATEGORIES, getActiveCategories } from "@/lib/categories";
import { HeroSection } from "@/components/storefront/HeroSection";
import { AuthenticitySection } from "@/components/storefront/AuthenticitySection";
import { PricingComparisonSection } from "@/components/storefront/PricingComparisonSection";
import { TrendingTabs } from "@/components/storefront/TrendingTabs";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { RedWaveBackground } from "@/components/effects/RedWaveBackground";
import { ListingStatus } from "@prisma/client";
import { getTotalPairs } from "@/lib/inventory";
import { motion } from "framer-motion";
export default async function HomePage() {
  // Get active categories for badge display
  const activeCategoryLabels = await getActiveCategories();
  
  // Get trending listings (most purchased)
  const trendingListings = await prisma.listing.findMany({
    where: { 
      status: ListingStatus.ACTIVE,
      orders: {
        some: {
          status: { in: ["CONFIRMED", "PAID", "SHIPPED"] }
        }
      }
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: true,
      tierPrices: true,
    },
    orderBy: {
      orders: { _count: "desc" }
    },
    take: 6,
  });

  // Fallback to recent listings if not enough trending ones
  let listings = trendingListings;
  if (trendingListings.length < 6) {
    const recentListings = await prisma.listing.findMany({
      where: { 
        status: ListingStatus.ACTIVE,
        id: { notIn: trendingListings.map(l => l.id) }
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        sizes: true,
        tierPrices: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6 - trendingListings.length,
    });
    
    listings = [...trendingListings, ...recentListings];
  }

  // Serialize Decimal fields for client components
  const serializedListings = listings.map(listing => ({
    ...listing,
    flatPricePerPair: listing.flatPricePerPair ? Number(listing.flatPricePerPair) : null,
    basePricePerPair: listing.basePricePerPair ? Number(listing.basePricePerPair) : null,
    costPerPair: listing.costPerPair ? Number(listing.costPerPair) : null,
    stockXPrice: listing.stockXPrice ? Number(listing.stockXPrice) : null,
    tierPrices: listing.tierPrices.map(tp => ({
      ...tp,
      pricePerPair: Number(tp.pricePerPair),
    })),
  }));

  // Prepare hero products (listings with images)
  const heroProducts = serializedListings
    .filter((l) => l.images.length > 0)
    .slice(0, 4)
    .map((l) => ({
      id: l.id,
      title: l.title,
      imageUrl: l.images[0].url,
    }));

  // Calculate stats for hero
  const allActiveListings = await prisma.listing.findMany({
    where: { status: ListingStatus.ACTIVE },
    include: { sizes: true },
  });

  const totalPairs = allActiveListings.reduce((sum, listing) => {
    return sum + getTotalPairs(listing);
  }, 0);

  const activeListingsCount = allActiveListings.length;

  // Calculate average StockX savings
  const listingsWithStockX = allActiveListings.filter(
    (l) => l.stockXPrice && l.flatPricePerPair
  );
  
  const avgSavings = listingsWithStockX.length > 0
    ? Math.round(
        listingsWithStockX.reduce((sum, l) => {
          const stockX = Number(l.stockXPrice);
          const our = Number(l.flatPricePerPair);
          return sum + ((stockX - our) / stockX) * 100;
        }, 0) / listingsWithStockX.length
      )
    : 15; // Default fallback

  const stats = {
    totalPairs,
    activeListings: activeListingsCount,
    avgSavings,
  };

  // Get top 5 deals with best StockX savings for hero phone mockup
  const allListingsWithPrices = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      stockXPrice: { not: null },
      flatPricePerPair: { not: null },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
    take: 100,
  });

  const topDeals = allListingsWithPrices
    .map(l => ({
      id: l.id,
      title: l.title,
      brand: l.brand || "Unknown",
      imageUrl: l.images[0]?.url || "",
      ourPrice: Number(l.flatPricePerPair),
      stockXPrice: Number(l.stockXPrice),
      savingsPercent: Math.round(
        ((Number(l.stockXPrice) - Number(l.flatPricePerPair)) / Number(l.stockXPrice)) * 100
      ),
      savingsDollar: Number(l.stockXPrice) - Number(l.flatPricePerPair),
    }))
    .filter(d => d.savingsPercent > 0 && d.imageUrl)
    .sort((a, b) => b.savingsPercent - a.savingsPercent)
    .slice(0, 6); // Changed from 5 to 6

  // Prepare best deals listings for carousel (get full listing data for top 6 deals)
  const bestDealsListings = await prisma.listing.findMany({
    where: {
      id: { in: topDeals.map(d => d.id) },
      status: ListingStatus.ACTIVE,
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: true,
      tierPrices: true,
    },
  });

  // Sort to match topDeals order (by savings percent)
  const sortedBestDeals = topDeals
    .map(deal => bestDealsListings.find(l => l.id === deal.id))
    .filter((listing): listing is NonNullable<typeof listing> => listing !== undefined)
    .map(listing => ({
      ...listing,
      flatPricePerPair: listing.flatPricePerPair ? Number(listing.flatPricePerPair) : null,
      basePricePerPair: listing.basePricePerPair ? Number(listing.basePricePerPair) : null,
      costPerPair: listing.costPerPair ? Number(listing.costPerPair) : null,
      stockXPrice: listing.stockXPrice ? Number(listing.stockXPrice) : null,
      tierPrices: listing.tierPrices.map(tp => ({
        ...tp,
        pricePerPair: Number(tp.pricePerPair),
      })),
    }));

  // Get listings with StockX prices for pricing comparison section
  const stockXListings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      stockXPrice: { not: null },
      flatPricePerPair: { not: null }
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } }
    },
    take: 10,
  });

  // Calculate savings and sort by best savings
  const pricingData = stockXListings
    .map(listing => {
      const stockXPrice = Number(listing.stockXPrice);
      const ourPrice = Number(listing.flatPricePerPair);
      const savings = stockXPrice - ourPrice;
      const savingsPercent = (savings / stockXPrice) * 100;
      
      return {
        id: listing.id,
        product: listing.title,
        stockXPrice,
        ourPrice,
        savings,
        savingsPercent,
        imageUrl: listing.images[0]?.url
      };
    })
    .sort((a, b) => b.savingsPercent - a.savingsPercent)
    .slice(0, 3);

  return (
    <>
      <RedWaveBackground />
      
      <div className="min-h-screen">
        <div className="noise-texture">
          {/* Hero Section with Phone Mockup */}
          <HeroSection heroProducts={heroProducts} topDeals={topDeals} />

        {/* Trending Now Section - Modern Glassmorphism Style */}
        <ScrollReveal>
          <section className="relative overflow-hidden border-t border-neutral-200/50 bg-white py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text text-transparent sm:text-4xl lg:text-5xl">
                  Trending Now
                </h2>
              </div>
              <TrendingTabs 
                trendingListings={serializedListings} 
                bestDealsListings={sortedBestDeals}
              />
            </div>
          </section>
        </ScrollReveal>

        {/* Authenticity Section */}
        <ScrollReveal>
          <AuthenticitySection />
        </ScrollReveal>

        {/* StockX Pricing Comparison - Only show if there are listings with StockX prices */}
        {pricingData.length > 0 && (
          <ScrollReveal>
            <PricingComparisonSection products={pricingData} />
          </ScrollReveal>
        )}

        {/* Browse by Categories - Only show if there's more than 1 category */}
        {activeCategoryLabels.length > 1 && (
          <ScrollReveal>
            <section className="border-t border-neutral-200 py-16 sm:py-20">
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <h2 className="text-center text-2xl font-light tracking-tight text-neutral-900 sm:text-3xl">
                  Browse by Categories
                </h2>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:mt-10 sm:gap-8">
                  {STOREFRONT_CATEGORIES.filter((cat) => 
                    activeCategoryLabels.includes(cat.label)
                  ).map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/browse?category=${cat.slug}`}
                      className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900 hover:underline sm:text-base"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}
        </div>
      </div>
    </>
  );
}
