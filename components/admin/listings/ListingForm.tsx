/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { useState } from "react";
import type { Listing, ListingSize, ListingTierPrice, ListingImage } from "@prisma/client";
import { InventoryMode, PricingMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "./ImageUploader";
import { extractStockXSlug } from "@/lib/stockx";

type ListingFormListing = Listing & {
  sizes?: ListingSize[];
  tierPrices?: ListingTierPrice[];
  images?: ListingImage[];
};

interface ListingFormProps {
  initialListing?: ListingFormListing;
  onSubmit: (data: FormData) => Promise<void>;
  mode: "create" | "edit";
}

const US_MEN_SIZES = [
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
  "10.5",
  "11",
  "11.5",
  "12",
  "13",
  "14",
];

export function ListingForm({ initialListing, onSubmit, mode }: ListingFormProps) {
  const [inventoryMode, setInventoryMode] = useState<InventoryMode>(
    initialListing?.inventoryMode ?? InventoryMode.SIZE_RUN,
  );
  const [pricingMode, setPricingMode] = useState<PricingMode>(
    initialListing?.pricingMode ?? PricingMode.FLAT,
  );
  const [instantBuy, setInstantBuy] = useState<boolean>(
    initialListing?.instantBuy ?? false,
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialListing?.images?.sort((a, b) => a.sortOrder - b.sortOrder).map(img => img.url) ?? []
  );
  const [extractedSKU, setExtractedSKU] = useState<string>(
    initialListing?.productSKU ?? ""
  );

  const handleImageUpload = (url: string) => {
    setImageUrls(prev => [...prev, url]);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleStockXUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      const slug = extractStockXSlug(url);
      if (slug) {
        setExtractedSKU(slug);
      }
    }
  };

  // Note: for MVP, we submit as a standard <form> with FormData

  return (
    <form
      action={onSubmit}
      className="space-y-6"
    >
      {/* Basics */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-slate-800">Basics</h2>
            <p className="text-xs text-slate-500">
              Title, category, and imagery for this wholesale batch.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Title
              </label>
              <Input
                name="title"
                defaultValue={initialListing?.title ?? ""}
                required
                placeholder="Foam runners – mixed size run"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Category
              </label>
              <Input
                name="category"
                defaultValue={initialListing?.category ?? ""}
                required
                placeholder="Slides & Mules"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Product Images
            </label>
            <ImageUploader
              onUpload={handleImageUpload}
              currentImages={imageUrls.map((url, idx) => ({ url, sortOrder: idx }))}
              onRemove={handleRemoveImage}
            />
            {/* Hidden inputs to pass image URLs to form submission */}
            {imageUrls.map((url, idx) => (
              <input
                key={idx}
                type="hidden"
                name={`images[${idx}]`}
                value={url}
              />
            ))}
            <p className="text-[11px] text-slate-500">
              Upload product images or paste URLs. First image will be the primary.
            </p>
          </div>
        </div>
      </Card>

      {/* MOQ */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-slate-800">Minimum order quantity</h2>
            <p className="text-xs text-slate-500">
              Buyers can&apos;t submit orders below this total pairs count.
            </p>
          </div>
          <div className="w-32 space-y-1.5">
            <label className="text-xs font-medium text-slate-700">MOQ</label>
            <Input
              name="moq"
              type="number"
              min={1}
              defaultValue={initialListing?.moq ?? 1}
              required
            />
          </div>
        </div>
      </Card>

      {/* Inventory */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-slate-800">Inventory</h2>
              <p className="text-xs text-slate-500">
                Track pairs either by size run or as a single mixed batch.
              </p>
            </div>
            <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setInventoryMode(InventoryMode.SIZE_RUN)}
                className={`flex-1 rounded-full px-3 py-1 ${
                  inventoryMode === InventoryMode.SIZE_RUN
                    ? "bg-card text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Size run
              </button>
              <button
                type="button"
                onClick={() => setInventoryMode(InventoryMode.MIXED_BATCH)}
                className={`flex-1 rounded-full px-3 py-1 ${
                  inventoryMode === InventoryMode.MIXED_BATCH
                    ? "bg-card text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Mixed batch
              </button>
            </div>
          </div>

          <input type="hidden" name="inventoryMode" value={inventoryMode} />

          {inventoryMode === InventoryMode.SIZE_RUN ? (
            <SizeRunGrid initialSizes={initialListing?.sizes} />
          ) : (
            <MixedBatchInput totalPairs={initialListing?.totalPairs ?? 0} />
          )}
        </div>
      </Card>

      {/* Pricing */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-slate-800">Pricing</h2>
              <p className="text-xs text-slate-500">
                Flat price per pair or decreasing tier pricing.
              </p>
            </div>
            <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPricingMode(PricingMode.FLAT)}
                className={`flex-1 rounded-full px-3 py-1 ${
                  pricingMode === PricingMode.FLAT
                    ? "bg-card text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Flat
              </button>
              <button
                type="button"
                onClick={() => setPricingMode(PricingMode.TIER)}
                className={`flex-1 rounded-full px-3 py-1 ${
                  pricingMode === PricingMode.TIER
                    ? "bg-card text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Tiered
              </button>
            </div>
          </div>

          <input type="hidden" name="pricingMode" value={pricingMode} />

          {pricingMode === PricingMode.FLAT ? (
            <div className="w-40 space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Price per pair (USD)
              </label>
              <Input
                name="flatPricePerPair"
                type="number"
                step="0.01"
                min={0}
                defaultValue={initialListing?.flatPricePerPair != null ? String(initialListing.flatPricePerPair) : ""}
              />
            </div>
          ) : (
            <TierPricingTable tiers={initialListing?.tierPrices ?? []} />
          )}
        </div>
      </Card>

      {/* Order Mode & Contextual Info */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-slate-800">Order mode</h2>
              <p className="text-xs text-slate-500">
                Instant buy: checkout immediately. Request: submit request, negotiate, then pay.
              </p>
            </div>
            <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setInstantBuy(false)}
                className={`flex-1 rounded-full px-3 py-1 ${
                  !instantBuy ? "bg-card text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Request
              </button>
              <button
                type="button"
                onClick={() => setInstantBuy(true)}
                className={`flex-1 rounded-full px-3 py-1 ${
                  instantBuy ? "bg-card text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Instant buy
              </button>
            </div>
          </div>
          <input type="hidden" name="instantBuy" value={instantBuy ? "true" : "false"} />

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-medium text-slate-700 mb-3">Contextual links (optional)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600">Seller notes</label>
                <Input
                  name="sellerNotes"
                  defaultValue={initialListing?.sellerNotes ?? ""}
                  placeholder="Condition, shipment, resale advice..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600">StockX link</label>
                <Input
                  name="stockXLink"
                  defaultValue={initialListing?.stockXLink ?? ""}
                  placeholder="https://stockx.com/..."
                  onChange={handleStockXUrlChange}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600">
                  Product SKU / Search Query
                  {extractedSKU && (
                    <span className="ml-2 text-xs text-emerald-600">✓ Auto-extracted</span>
                  )}
                </label>
                <Input
                  name="productSKU"
                  value={extractedSKU}
                  onChange={(e) => setExtractedSKU(e.target.value)}
                  placeholder="air-jordan-1-high-heritage or CW2288-111"
                />
                <p className="text-[10px] text-slate-500">
                  Used to fetch StockX pricing. Auto-extracted from URL or enter manually.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600">Discord</label>
                <Input
                  name="discordLink"
                  defaultValue={initialListing?.discordLink ?? ""}
                  placeholder="https://discord.gg/..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600">Instagram</label>
                <Input
                  name="instagramLink"
                  defaultValue={initialListing?.instagramLink ?? ""}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          {mode === "create"
            ? "You can save as draft and publish later."
            : "Changes are saved to this listing; you can archive at any time."}
        </div>
        <div className="flex gap-2">
          <Button type="submit" name="intent" value="draft" variant="ghost">
            Save draft
          </Button>
          <Button type="submit" name="intent" value="publish">
            Publish
          </Button>
        </div>
      </div>
    </form>
  );
}

function SizeRunGrid({ initialSizes }: { initialSizes?: ListingSize[] }) {
  const rows = initialSizes && initialSizes.length > 0 ? initialSizes : [];

  // For MVP, render up to 6 editable rows keyed by index
  const rowCount = Math.max(rows.length, 6);
  const indices = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {indices.map((index) => {
        const existing = rows[index];
        return (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
          >
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Size (US Men)
              </label>
              <select
                name={`sizes[${index}].sizeLabel`}
                defaultValue={existing?.sizeLabel ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="">Select size</option>
                {US_MEN_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Quantity
              </label>
              <Input
                name={`sizes[${index}].quantity`}
                type="number"
                min={0}
                defaultValue={existing?.quantity ?? ""}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600">Sold out</span>
              <input
                type="checkbox"
                name={`sizes[${index}].soldOut`}
                defaultChecked={existing?.soldOut ?? false}
                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900/40"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MixedBatchInput({ totalPairs }: { totalPairs: number }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="w-40 space-y-1.5">
        <label className="text-xs font-medium text-slate-700">
          Total pairs
        </label>
        <Input
          name="totalPairs"
          type="number"
          min={0}
          defaultValue={totalPairs || ""}
        />
      </div>
      <p className="text-xs text-slate-500">
        Use this when sizes are mixed or not tracked individually.
      </p>
    </div>
  );
}

function TierPricingTable({ tiers }: { tiers: ListingTierPrice[] }) {
  const rowCount = Math.max(tiers.length, 4);
  const rows = Array.from({ length: rowCount }, (_, i) => tiers[i]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
        <div>Min qty</div>
        <div>Price / pair (USD)</div>
      </div>
      <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
        {rows.map((tier, index) => (
          <div
            key={index}
            className="grid grid-cols-2 gap-2"
          >
            <Input
              name={`tiers[${index}].minQty`}
              type="number"
              min={1}
              defaultValue={tier?.minQty ?? ""}
              className="h-8 text-xs"
            />
            <Input
              name={`tiers[${index}].pricePerPair`}
              type="number"
              step="0.01"
              min={0}
              defaultValue={tier?.pricePerPair != null ? String(tier.pricePerPair) : ""}
              className="h-8 text-xs"
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">
        The best tier where order quantity ≥ min qty will be applied.
      </p>
    </div>
  );
}

