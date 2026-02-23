import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STOREFRONT_CATEGORIES, getActiveCategories } from "@/lib/categories";
import { HeroSection } from "@/components/storefront/HeroSection";
import { AuthenticitySection } from "@/components/storefront/AuthenticitySection";
import { SocialProofSection } from "@/components/storefront/SocialProofSection";
import { TrendingTabs } from "@/components/storefront/TrendingTabs";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { RedWaveBackground } from "@/components/effects/RedWaveBackground";
import { ListingStatus } from "@prisma/client";
import { getTotalPairs } from "@/lib/inventory";
export default async function HomePage() {
  let activeCategoryLabels: string[];
  let serializedListings: Awaited<ReturnType<typeof loadListings>>["serializedListings"];
  let heroProducts: { id: number; title: string; imageUrl: string }[];
  let stats: { totalPairs: number; activeListings: number; avgSavings: number };
  let topDeals: { id: number; title: string; brand: string; imageUrl: string; ourPrice: number; stockXPrice: number; savingsPercent: number; savingsDollar: number }[];
  let sortedBestDeals: Awaited<ReturnType<typeof loadListings>>["sortedBestDeals"];
  async function loadListings() {
    const activeCategoryLabelsInner = await getActiveCategories();

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

    const serializedListingsInner = listings.map(listing => ({
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

    const heroProductsInner = serializedListingsInner
      .filter((l) => l.images.length > 0)
      .slice(0, 4)
      .map((l) => ({
        id: l.id,
        title: l.title,
        imageUrl: l.images[0].url,
      }));

    const allActiveListings = await prisma.listing.findMany({
      where: { status: ListingStatus.ACTIVE },
      include: { sizes: true },
    });

    const totalPairs = allActiveListings.reduce((sum, listing) => sum + getTotalPairs(listing), 0);
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
      : 15;

    // Build top deals from serialized listings — works with flat or tier pricing
    // Filter out deals where StockX price is lower than our price (no savings to show)
    const topDealsInner = serializedListingsInner
      .filter(l => l.images.length > 0)
      .slice(0, 6)
      .map(l => {
        const ourPrice = l.flatPricePerPair
          ?? (l.tierPrices.length > 0 ? Number(l.tierPrices[0].pricePerPair) : 0);
        const stockX = l.stockXPrice ?? 0;
        const savingsDollar = stockX > 0 && ourPrice > 0
          ? Math.round((stockX - ourPrice) * 100) / 100
          : 0;
        const savingsPercent = stockX > 0 && ourPrice > 0
          ? Math.round(((stockX - ourPrice) / stockX) * 100)
          : 0;
        return {
          id: l.id,
          title: l.title,
          brand: l.brand || "Unknown",
          imageUrl: l.images[0].url,
          ourPrice,
          stockXPrice: stockX,
          savingsPercent: Math.max(savingsPercent, 0),
          savingsDollar: Math.max(savingsDollar, 0),
        };
      })
      .filter(deal => deal.stockXPrice === 0 || deal.stockXPrice >= deal.ourPrice);

    const bestDealsListings = await prisma.listing.findMany({
      where: {
        id: { in: topDealsInner.map(d => d.id) },
        status: ListingStatus.ACTIVE,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        sizes: true,
        tierPrices: true,
      },
    });

    const sortedBestDealsInner = topDealsInner
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

    return {
      activeCategoryLabels: activeCategoryLabelsInner,
      serializedListings: serializedListingsInner,
      heroProducts: heroProductsInner,
      stats: { totalPairs, activeListings: allActiveListings.length, avgSavings },
      topDeals: topDealsInner,
      sortedBestDeals: sortedBestDealsInner,
    };
  }

  try {
    const data = await loadListings();
    activeCategoryLabels = data.activeCategoryLabels;
    serializedListings = data.serializedListings;
    heroProducts = data.heroProducts;
    stats = data.stats;
    topDeals = data.topDeals;
    sortedBestDeals = data.sortedBestDeals;
  } catch {
    activeCategoryLabels = [];
    serializedListings = [];
    heroProducts = [];
    stats = { totalPairs: 0, activeListings: 0, avgSavings: 15 };
    topDeals = [];
    sortedBestDeals = [];
  }

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

        {/* Social Proof & Testimonials */}
        <ScrollReveal>
          <SocialProofSection />
        </ScrollReveal>

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
