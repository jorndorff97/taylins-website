"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getTotalPairs } from "@/lib/inventory";
import { ListingStatus, PricingMode } from "@prisma/client";
import type { Listing, ListingImage, ListingSize, ListingTierPrice } from "@prisma/client";
import {
  duplicateListing,
  markListingSoldOut,
  archiveListing,
  deleteListing,
} from "@/app/admin/(dashboard)/listings/actions";
import { useState } from "react";

interface SerializedListing extends Omit<Listing, "flatPricePerPair" | "basePricePerPair" | "stockXPrice"> {
  flatPricePerPair: number | null;
  basePricePerPair: number | null;
  stockXPrice: number | null;
  images: ListingImage[];
  sizes: ListingSize[];
  tierPrices: (Omit<ListingTierPrice, "pricePerPair" | "discountPercent"> & { 
    pricePerPair: number | null;
    discountPercent: number | null;
  })[];
}

interface ListingDesktopCardProps {
  listing: SerializedListing;
}

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getDisplayPrice(listing: SerializedListing): { label: string; price: string } {
  if (listing.pricingMode === PricingMode.FLAT && listing.flatPricePerPair) {
    return { label: "Per pair", price: formatPrice(listing.flatPricePerPair) };
  }
  
  if (listing.pricingMode === PricingMode.TIER && listing.tierPrices.length > 0) {
    const sortedTiers = [...listing.tierPrices].sort((a, b) => a.minQty - b.minQty);
    const lowestTier = sortedTiers[0];
    if (lowestTier?.pricePerPair) {
      return { label: "From", price: formatPrice(lowestTier.pricePerPair) };
    }
  }
  
  if (listing.basePricePerPair) {
    return { label: "Base", price: formatPrice(listing.basePricePerPair) };
  }
  
  return { label: "Price", price: "—" };
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

export function ListingDesktopCard({ listing }: ListingDesktopCardProps) {
  const totalPairs = getTotalPairs(listing as any);
  const primaryImage = listing.images[0]?.url;
  const { label: priceLabel, price } = getDisplayPrice(listing);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isSoldOut = listing.status === "SOLD_OUT";
  const isArchived = listing.status === "ARCHIVED";

  return (
    <>
      <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
        <div className="flex gap-4">
          <Link 
            href={`/admin/listings/${listing.id}/edit`}
            className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100"
          >
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage}
                alt={listing.title}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                No image
              </div>
            )}
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/listings/${listing.id}/edit`}
                  className="block text-sm font-semibold text-slate-900 hover:text-slate-700 truncate"
                >
                  {listing.title}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">{listing.category}</p>
              </div>
              <ListingStatusBadge status={listing.status} />
            </div>
            
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-slate-900">{price}</span>
                <span className="text-xs text-slate-400">{priceLabel}</span>
              </div>
              {listing.stockXPrice && (
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
                  <span className="text-[10px] font-medium text-emerald-700">StockX</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {formatPrice(listing.stockXPrice)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span><strong className="text-slate-700">{totalPairs}</strong> pairs</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>MOQ <strong className="text-slate-700">{listing.moq}</strong></span>
              </div>
              <span className="text-slate-300">|</span>
              <Badge variant="muted" className="text-[10px]">
                {listing.pricingMode === PricingMode.FLAT ? "Flat" : "Tier"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <Link
            href={`/admin/listings/${listing.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              More
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDuplicateModal(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </button>
                  <form action={markListingSoldOut}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button
                      type="submit"
                      disabled={isSoldOut}
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Mark sold out
                    </button>
                  </form>
                  <form action={archiveListing}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button
                      type="submit"
                      disabled={isArchived}
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Archive
                    </button>
                  </form>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteModal(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setShowDuplicateModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-900">
              Duplicate listing
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Choose how to copy this listing.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <form action={duplicateListing}>
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="copyInventory" value="true" />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Copy with inventory
                </button>
              </form>
              <form action={duplicateListing}>
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="copyInventory" value="false" />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Copy, reset inventory
                </button>
              </form>
            </div>
            <button
              type="button"
              onClick={() => setShowDuplicateModal(false)}
              className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Delete listing
                </h3>
                <p className="text-sm text-slate-600">
                  This cannot be undone.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Are you sure you want to permanently delete this listing? All images, inventory, and pricing data will be removed.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <form action={deleteListing} className="flex-1">
                <input type="hidden" name="listingId" value={listing.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
