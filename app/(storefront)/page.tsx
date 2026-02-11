import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STOREFRONT_CATEGORIES, getActiveCategories } from "@/lib/categories";
import { HeroSection } from "@/components/storefront/HeroSection";
import { AuthenticitySection } from "@/components/storefront/AuthenticitySection";
import { PricingComparisonSection } from "@/components/storefront/PricingComparisonSection";
import { Top10Carousel } from "@/components/storefront/Top10Carousel";
import { ListingStatus } from "@prisma/client";
import { getTotalPairs } from "@/lib/inventory";

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
    take: 10,
  });

  // Fallback to recent listings if not enough trending ones
  let listings = trendingListings;
  if (trendingListings.length < 10) {
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
      take: 10 - trendingListings.length,
    });
    
    listings = [...trendingListings, ...recentListings];
  }

  // Prepare hero products (listings with images)
  const heroProducts = listings
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
      {/* Hero Section with Rotating Text */}
      <HeroSection heroProducts={heroProducts} stats={stats} />

      {/* Trending Listings Grid - Zellerfeld "Top 10" Style */}
      <section className="border-t border-slate-100 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 sm:mb-16">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Top 10
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Most popular wholesale sneakers right now
            </p>
          </div>
          <Top10Carousel listings={listings} />
        </div>
      </section>

      {/* Authenticity Section */}
      <AuthenticitySection />

      {/* StockX Pricing Comparison - Only show if there are listings with StockX prices */}
      {pricingData.length > 0 && (
        <PricingComparisonSection products={pricingData} />
      )}

      {/* Browse by Categories - Only show if there's more than 1 category */}
      {activeCategoryLabels.length > 1 && (
        <section className="border-t border-slate-100 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-light tracking-tight text-slate-900 sm:text-3xl">
              Browse by Categories
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:mt-10 sm:gap-8">
              {STOREFRONT_CATEGORIES.filter((cat) => 
                activeCategoryLabels.includes(cat.label)
              ).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/browse?category=${cat.slug}`}
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900 hover:underline sm:text-base"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
