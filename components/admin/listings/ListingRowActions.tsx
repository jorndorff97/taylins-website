"use client";

import Link from "next/link";
import { useState } from "react";
import {
  duplicateListing,
  markListingSoldOut,
  archiveListing,
} from "@/app/admin/(dashboard)/listings/actions";

interface ListingRowActionsProps {
  listingId: number;
  status: string;
}

export function ListingRowActions({ listingId, status }: ListingRowActionsProps) {
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const isSoldOut = status === "SOLD_OUT";
  const isArchived = status === "ARCHIVED";

  return (
    <>
      <div className="inline-flex gap-2 text-xs">
        <Link
          href={`/admin/listings/${listingId}/edit`}
          className="text-slate-700 hover:text-slate-900"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => setShowDuplicateModal(true)}
          className="text-slate-500 hover:text-slate-900"
        >
          Duplicate
        </button>
        <form action={markListingSoldOut} className="inline">
          <input type="hidden" name="listingId" value={listingId} />
          <button
            type="submit"
            disabled={isSoldOut}
            className="text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sold out
          </button>
        </form>
        <form action={archiveListing} className="inline">
          <input type="hidden" name="listingId" value={listingId} />
          <button
            type="submit"
            disabled={isArchived}
            className="text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Archive
          </button>
        </form>
      </div>

      {showDuplicateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50"
          onClick={() => setShowDuplicateModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-slate-900">
              Duplicate options
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Choose how to copy this listing.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <form action={duplicateListing}>
                <input type="hidden" name="listingId" value={listingId} />
                <input type="hidden" name="copyInventory" value="true" />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Copy with inventory
                </button>
              </form>
              <form action={duplicateListing}>
                <input type="hidden" name="listingId" value={listingId} />
                <input type="hidden" name="copyInventory" value="false" />
                <button
                  type="submit"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Copy, reset inventory
                </button>
              </form>
            </div>
            <button
              type="button"
              onClick={() => setShowDuplicateModal(false)}
              className="mt-4 w-full text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
