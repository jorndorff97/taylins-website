import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ListingMobileCard } from "@/components/admin/listings/ListingMobileCard";
import { ListingDesktopCard } from "@/components/admin/listings/ListingDesktopCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const listings = await prisma.listing.findMany({
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: true,
      tierPrices: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Serialize listings for client components (convert Decimal to number)
  const serializedListings = listings.map((listing) => ({
    ...listing,
    flatPricePerPair: listing.flatPricePerPair
      ? Number(listing.flatPricePerPair)
      : null,
    basePricePerPair: listing.basePricePerPair
      ? Number(listing.basePricePerPair)
      : null,
    stockXPrice: listing.stockXPrice
      ? Number(listing.stockXPrice)
      : null,
    tierPrices: listing.tierPrices.map((tier) => ({
      ...tier,
      pricePerPair: tier.pricePerPair ? Number(tier.pricePerPair) : null,
      discountPercent: tier.discountPercent ? Number(tier.discountPercent) : null,
    })),
  }));

  return (
    <>
      <AdminHeader
        title="Listings"
        actions={
          <Link href="/admin/listings/new">
            <Button>Create listing</Button>
          </Link>
        }
      />
      <main className="flex-1 bg-background px-4 pb-10 pt-6 md:px-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-slate-700">
                Wholesale batches
              </h2>
              <p className="text-xs text-slate-500">
                Manage active, draft, and archived listings.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search by title..."
                className="w-full sm:w-56"
                // Note: search behavior can be wired later
              />
            </div>
          </div>

          {/* Mobile Card Grid */}
          <div className="block space-y-4 md:hidden">
            {serializedListings.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No listings yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Create your first batch to start taking orders.
                  </p>
                  <Link href="/admin/listings/new" className="mt-4 inline-block">
                    <Button variant="secondary">Create listing</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              serializedListings.map((listing) => (
                <ListingMobileCard key={listing.id} listing={listing} />
              ))
            )}
          </div>

          {/* Desktop Card Grid */}
          <div className="hidden md:block">
            {serializedListings.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    No listings yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Create your first batch to start taking orders.
                  </p>
                  <Link href="/admin/listings/new" className="mt-6 inline-block">
                    <Button>Create your first listing</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {serializedListings.map((listing) => (
                  <ListingDesktopCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
