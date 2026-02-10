import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STOREFRONT_CATEGORIES } from "@/lib/categories";
import { ListingCard } from "@/components/storefront/ListingCard";
import { ListingStatus } from "@prisma/client";

export default async function HomePage() {
  const listings = await prisma.listing.findMany({
    where: { status: ListingStatus.ACTIVE },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: true,
      tierPrices: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const heroProduct = listings.find((l) => l.images.length > 0);

  return (
    <>
      {/* Hero - Full screen with product background */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
        {heroProduct && (
          <div className="absolute inset-0 animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroProduct.images[0].url}
              alt=""
              className="h-full w-full object-cover opacity-[0.08] blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white" />
          </div>
        )}
        {!heroProduct && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        )}
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center animate-fade-in-up">
          <h1 className="text-5xl font-light tracking-tighter text-slate-900 sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
            Wholesale sneakers.
            <br />
            <span className="font-extralight text-hero-accent">Done right.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 sm:mt-8 sm:text-xl md:text-2xl">
            Curated wholesale marketplace for premium sneakers.
          </p>
          <Link
            href="/browse"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:mt-12 sm:px-10 sm:py-4 sm:text-base"
          >
            Explore listings
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Browse by Categories */}
      <section className="border-t border-slate-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-light tracking-tight text-slate-900 sm:text-3xl">
            Browse by Categories
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:mt-10 sm:gap-8">
            {STOREFRONT_CATEGORIES.map((cat) => (
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

      {/* Top Listings Grid */}
      <section className="border-t border-slate-100 bg-slate-50/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-light tracking-tight text-slate-900 sm:text-3xl">
              Top Listings
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
                <ListingCard key={listing.id} listing={listing} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
