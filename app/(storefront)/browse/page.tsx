import { prisma } from "@/lib/prisma";
import { STOREFRONT_CATEGORIES, getCategoryStatus, getActiveCategories } from "@/lib/categories";
import { ComingSoon } from "@/components/storefront/ComingSoon";
import { BrowseFilters } from "@/components/storefront/BrowseFilters";
import { ListingStatus } from "@prisma/client";

interface BrowsePageProps {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; brands?: string; price?: string; categories?: string }>;
}

function slugToCategoryFilter(slug: string): string | null {
  const found = STOREFRONT_CATEGORIES.find((c) => c.slug === slug);
  return found?.label ?? null;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const categorySlug = params.category ?? "";
  const search = params.q ?? "";
  const sort = params.sort ?? "newest";

  const categoryLabel = categorySlug ? slugToCategoryFilter(categorySlug) : null;
  
  // Get active categories for badge display
  const activeCategoryLabels = await getActiveCategories();
  
  // Check if selected category has listings
  const categoryHasListings = categoryLabel ? await getCategoryStatus(categoryLabel) : true;
  
  // Show coming soon page if category has no listings and no search query
  if (categoryLabel && !categoryHasListings && !search) {
    return <ComingSoon categoryLabel={categoryLabel} categorySlug={categorySlug} />;
  }

  let listings;
  let allBrands: string[] = [];
  
  try {
    // Fetch ALL active listings - category filtering happens client-side for instant switching
    listings = await prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        sizes: true,
        tierPrices: true,
      },
      orderBy:
        sort === "price-asc"
          ? { flatPricePerPair: "asc" }
          : sort === "price-desc"
            ? { flatPricePerPair: "desc" }
            : { updatedAt: "desc" },
    });

    // Get unique brands from active listings
    const brandsResult = await prisma.listing.findMany({
      where: { status: ListingStatus.ACTIVE, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    });
    allBrands = brandsResult
      .map((l) => l.brand)
      .filter((b): b is string => b !== null)
      .sort();
  } catch {
    listings = [];
  }

  // Serialize Decimal fields for client components
  const serializedListings = listings.map((listing: (typeof listings)[number]) => ({
    ...listing,
    flatPricePerPair: listing.flatPricePerPair ? Number(listing.flatPricePerPair) : null,
    basePricePerPair: listing.basePricePerPair ? Number(listing.basePricePerPair) : null,
    costPerPair: listing.costPerPair ? Number(listing.costPerPair) : null,
    stockXPrice: listing.stockXPrice ? Number(listing.stockXPrice) : null,
    tierPrices: listing.tierPrices.map((tp) => ({
      ...tp,
      pricePerPair: Number(tp.pricePerPair),
    })),
  }));

  // Sort tiered listings if they don't have flatPricePerPair
  if (sort === "price-asc" || sort === "price-desc") {
    serializedListings.sort((a, b) => {
      const priceA = a.flatPricePerPair ?? (a.tierPrices.length > 0 ? a.tierPrices[0].pricePerPair : 0);
      const priceB = b.flatPricePerPair ?? (b.tierPrices.length > 0 ? b.tierPrices[0].pricePerPair : 0);
      return sort === "price-asc" ? priceA - priceB : priceB - priceA;
    });
  }

  // Prepare category options for the filter
  const categoryOptions = STOREFRONT_CATEGORIES.map((cat) => ({
    slug: cat.slug,
    label: cat.label,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Browse Listings
        </h1>
      </div>

      <BrowseFilters
        listings={serializedListings}
        categories={categoryOptions}
        activeCategories={activeCategoryLabels}
        brands={allBrands}
        currentCategory={categorySlug}
        currentSearch={search}
        currentSort={sort}
      />
    </div>
  );
}
