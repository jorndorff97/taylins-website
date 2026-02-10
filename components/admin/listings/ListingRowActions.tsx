"use client";

import Link from "next/link";
import { useState } from "react";
import {
  duplicateListing,
  markListingSoldOut,
  archiveListing,
  deleteListing,
} from "@/app/admin/(dashboard)/listings/actions";

interface ListingRowActionsProps {
  listingId: number;
  status: string;
}

export function ListingRowActions({ listingId, status }: ListingRowActionsProps) {
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isSoldOut = status === "SOLD_OUT";
  const isArchived = status === "ARCHIVED";

  return (
    <>
      {/* Desktop Actions */}
      <div className="hidden items-center gap-2 text-xs md:inline-flex">
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
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="text-red-600 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      {/* Mobile Actions */}
      <div className="relative md:hidden">
        <div className="flex gap-2">
          <Link
            href={`/admin/listings/${listingId}/edit`}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50"
            aria-label="More actions"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowDuplicateModal(true);
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Duplicate
              </button>
              <form action={markListingSoldOut} className="block">
                <input type="hidden" name="listingId" value={listingId} />
                <button
                  type="submit"
                  disabled={isSoldOut}
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Mark sold out
                </button>
              </form>
              <form action={archiveListing} className="block">
                <input type="hidden" name="listingId" value={listingId} />
                <button
                  type="submit"
                  disabled={isArchived}
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Archive
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowDeleteModal(true);
                }}
                className="w-full border-t border-slate-100 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
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
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Copy with inventory
                </button>
              </form>
              <form action={duplicateListing}>
                <input type="hidden" name="listingId" value={listingId} />
                <input type="hidden" name="copyInventory" value="false" />
                <button
                  type="submit"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
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
                <h3 className="text-sm font-semibold text-slate-900">
                  Delete listing
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to permanently delete this listing? All images, inventory, and pricing data will be removed.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <form action={deleteListing} className="flex-1">
                <input type="hidden" name="listingId" value={listingId} />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
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
