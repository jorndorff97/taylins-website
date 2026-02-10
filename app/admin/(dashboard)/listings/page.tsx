import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ListingRowActions } from "@/components/admin/listings/ListingRowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getTotalPairs } from "@/lib/inventory";
import { ListingStatus, PricingMode } from "@prisma/client";
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
      <main className="flex-1 bg-background px-6 pb-10 pt-6">
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
                className="w-56"
                // Note: search behavior can be wired later
              />
            </div>
          </div>

          <Card className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Listing</TH>
                  <TH>MOQ</TH>
                  <TH>Total pairs</TH>
                  <TH>Pricing</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {listings.length === 0 && (
                  <TR>
                    <TD colSpan={6}>
                      <div className="flex items-center justify-between py-6">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            No listings yet
                          </p>
                          <p className="text-xs text-slate-500">
                            Create your first batch to start taking orders.
                          </p>
                        </div>
                        <Link href="/admin/listings/new">
                          <Button variant="secondary">Create listing</Button>
                        </Link>
                      </div>
                    </TD>
                  </TR>
                )}
                {listings.map((listing) => {
                  const totalPairs = getTotalPairs(listing);
                  const primaryImage = listing.images[0]?.url;

                  return (
                    <TR key={listing.id}>
                      <TD>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                            {primaryImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={primaryImage}
                                alt={listing.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                                No image
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {listing.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {listing.category}
                            </p>
                          </div>
                        </div>
                      </TD>
                      <TD>{listing.moq}</TD>
                      <TD>{totalPairs}</TD>
                      <TD>
                        <Badge variant="muted">
                          {listing.pricingMode === PricingMode.FLAT
                            ? "Flat"
                            : "Tier"}
                        </Badge>
                      </TD>
                      <TD>
                        <ListingStatusBadge status={listing.status} />
                      </TD>
                      <TD className="text-right">
                        <ListingRowActions
                          listingId={listing.id}
                          status={listing.status}
                        />
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </Card>
        </div>
      </main>
    </>
  );
}

function ListingStatusBadge({ status }: { status: ListingStatus }) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>;
    case "SOLD_OUT":
      return <Badge variant="danger">Sold out</Badge>;
    case "ARCHIVED":
      return <Badge variant="muted">Archived</Badge>;
    case "DRAFT":
    default:
      return <Badge variant="default">Draft</Badge>;
  }
}
