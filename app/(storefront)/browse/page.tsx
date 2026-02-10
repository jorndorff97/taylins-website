import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STOREFRONT_CATEGORIES } from "@/lib/categories";
import { ListingCard } from "@/components/storefront/ListingCard";
import { ListingStatus } from "@prisma/client";

interface BrowsePageProps {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
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

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      ...(categoryLabel && {
        category: { equals: categoryLabel, mode: "insensitive" },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Browse Listings
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <form method="get" className="flex gap-2">
            <input type="hidden" name="category" value={categorySlug} />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search..."
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Search
            </button>
          </form>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Sort:</span>
            <Link
              href={`/browse?category=${categorySlug}&q=${encodeURIComponent(search)}&sort=newest`}
              className={`rounded px-2 py-1 text-sm ${sort === "newest" ? "font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              Newest
            </Link>
            <Link
              href={`/browse?category=${categorySlug}&q=${encodeURIComponent(search)}&sort=price-asc`}
              className={`rounded px-2 py-1 text-sm ${sort === "price-asc" ? "font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              Price ↑
            </Link>
            <Link
              href={`/browse?category=${categorySlug}&q=${encodeURIComponent(search)}&sort=price-desc`}
              className={`rounded px-2 py-1 text-sm ${sort === "price-desc" ? "font-medium text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              Price ↓
            </Link>
          </div>
        </div>
      </div>

      {/* Category strip */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/browse"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${!categorySlug ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
        >
          All
        </Link>
        {STOREFRONT_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/browse?category=${cat.slug}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${categorySlug === cat.slug ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <p className="mt-12 text-slate-500">
          No listings match your filters.{" "}
          <Link href="/browse" className="text-hero-accent hover:underline">
            Clear filters
          </Link>
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
