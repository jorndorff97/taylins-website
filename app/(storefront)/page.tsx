import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STOREFRONT_CATEGORIES } from "@/lib/categories";
import { ListingCard } from "@/components/storefront/ListingCard";
import { ListingStatus } from "@prisma/client";

export default async function HomePage() {
  const [listings] = await Promise.all([
    prisma.listing.findMany({
      where: { status: ListingStatus.ACTIVE },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        sizes: true,
        tierPrices: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <>
      {/* Hero - Legend-style */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2394a3b8%22%20fill-opacity%3D%220.15%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Wholesale sneakers.
            <br />
            <span className="text-hero-accent">Done right.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600">
            Curated wholesale marketplace for premium sneakers. Browse listings, request orders, and grow your business.
          </p>
          <Link
            href="/browse"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Explore listings
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Browse by Categories */}
      <section className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Browse by Categories
          </h2>
          <div className="mt-6 flex flex-wrap gap-4">
            {STOREFRONT_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/browse?category=${cat.slug}`}
                className="group flex min-w-[140px] flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
                  <span className="text-2xl">👟</span>
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Listings Grid */}
      <section className="border-t border-slate-100 bg-slate-50/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Top Listings
            </h2>
            <Link
              href="/browse"
              className="text-sm font-medium text-hero-accent hover:underline"
            >
              See all
            </Link>
          </div>
          {listings.length === 0 ? (
            <p className="mt-8 text-slate-500">No listings yet. Check back soon.</p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
