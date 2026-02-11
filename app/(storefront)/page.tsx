import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STOREFRONT_CATEGORIES, getActiveCategories } from "@/lib/categories";
import { ListingCard } from "@/components/storefront/ListingCard";
import { HeroSection } from "@/components/storefront/HeroSection";
import { AuthenticitySection } from "@/components/storefront/AuthenticitySection";
import { PricingComparisonSection } from "@/components/storefront/PricingComparisonSection";
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

  return (
    <>
      {/* Hero Section with Rotating Text */}
      <HeroSection heroProducts={heroProducts} stats={stats} />

      {/* Browse by Categories */}
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

      {/* Authenticity Section */}
      <AuthenticitySection />

      {/* StockX Pricing Comparison */}
      <PricingComparisonSection />

      {/* Trending Listings Grid */}
      <section className="border-t border-slate-100 bg-slate-50/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-light tracking-tight text-slate-900 sm:text-3xl">
              Trending
            </h2>
            <Link
              href="/browse"
              className="text-xs font-medium text-hero-accent hover:underline sm:text-sm"
            >
              See all
            </Link>
          </div>
          {listings.length === 0 ? (
            <p className="mt-8 text-slate-500 sm:mt-12">No listings yet. Check back soon.</p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-6 sm:mt-12 sm:grid-cols-3 sm:gap-8 md:grid-cols-4 lg:grid-cols-5">
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} rank={i + 1} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
