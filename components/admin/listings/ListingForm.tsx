/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { useState, useTransition } from "react";
import type { Listing, ListingSize, ListingTierPrice, ListingImage } from "@prisma/client";
import { InventoryMode, PricingMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "./ImageUploader";
import { extractStockXSlug, extractBrandFromSlug } from "@/lib/stockx";

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
  const [isPending, startTransition] = useTransition();
  const [inventoryMode, setInventoryMode] = useState<InventoryMode>(
    initialListing?.inventoryMode ?? InventoryMode.SIZE_RUN,
  );
  const [pricingMode, setPricingMode] = useState<PricingMode>(
    initialListing?.pricingMode ?? PricingMode.FLAT,
  );
  const [tierPricingType, setTierPricingType] = useState<"FIXED_PRICE" | "PERCENTAGE_OFF">(
    "FIXED_PRICE"  // Default to fixed price for now
  );
  const [basePricePerPair, setBasePricePerPair] = useState(
    initialListing?.basePricePerPair?.toString() ?? 
    initialListing?.flatPricePerPair?.toString() ?? ""
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialListing?.images?.sort((a, b) => a.sortOrder - b.sortOrder).map(img => img.url) ?? []
  );
  const [productSKU, setProductSKU] = useState<string>(
    initialListing?.productSKU ?? ""
  );
  const [title, setTitle] = useState<string>(initialListing?.title ?? "");
  const [brand, setBrand] = useState<string>(initialListing?.brand ?? "");
  const [category, setCategory] = useState<string>(initialListing?.category ?? "");
  const [useManualPrice, setUseManualPrice] = useState<boolean>(false);
  const [manualPrice, setManualPrice] = useState<string>(
    initialListing?.stockXPrice ? String(initialListing.stockXPrice) : ""
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
        // Use transition to prevent blocking form submission
        startTransition(() => {
          // Auto-generate title from slug (only if title is empty)
          if (!title) {
            const suggestedTitle = slug
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            setTitle(suggestedTitle);
          }
          
          // Auto-suggest brand from slug (only if brand is empty)
          if (!brand) {
            const suggestedBrand = extractBrandFromSlug(slug);
            if (suggestedBrand) {
              setBrand(suggestedBrand);
            }
          }
          
          // Auto-suggest category based on keywords (only if category is empty)
          if (!category) {
            const lowerUrl = url.toLowerCase();
            if (lowerUrl.includes('jordan') || lowerUrl.includes('nike') || lowerUrl.includes('adidas') || lowerUrl.includes('yeezy')) {
              if (lowerUrl.includes('slide') || lowerUrl.includes('mule')) {
                setCategory('Slides & Mules');
              } else if (lowerUrl.includes('boot')) {
                setCategory('Boots');
              } else {
                setCategory('Sneakers');
              }
            } else {
              setCategory('Sneakers'); // Default
            }
          }
        });
      }
    }
  };

  return (
    <form
      action={onSubmit}
      className="space-y-6"
    >
      {/* StockX Integration - At the top! */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-slate-800">StockX Integration (Optional)</h2>
            <p className="text-xs text-slate-500">
              Add StockX link for reference and style code for automatic price comparison.
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">StockX Product URL</label>
              <Input
                name="stockXLink"
                defaultValue={initialListing?.stockXLink ?? ""}
                placeholder="https://stockx.com/air-jordan-1-retro-low-og-chicago-2025"
                onChange={handleStockXUrlChange}
              />
              {title && brand && category && (
                <p className="text-xs text-emerald-600">
                  ✓ Suggested title: &quot;{title}&quot; • Brand: &quot;{brand}&quot; • Category: &quot;{category}&quot;
                </p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Product Style Code
              </label>
              <Input
                name="productSKU"
                value={productSKU}
                onChange={(e) => setProductSKU(e.target.value)}
                placeholder="HQ6448, CW2288-111, GZ5541"
              />
              <p className="text-[10px] text-slate-500">
                Nike/Jordan style code from the box or StockX page. Used for automatic price comparison.
              </p>
            </div>
            
            {/* Manual Price Override Option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useManualPrice"
                checked={useManualPrice}
                onChange={(e) => setUseManualPrice(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="useManualPrice" className="text-xs text-slate-600">
                Manually set StockX price (overrides API lookup)
              </label>
            </div>
            
            {useManualPrice && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Manual StockX Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="manualStockXPrice"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="299.99"
                />
                <p className="text-[10px] text-slate-500">
                  This will be used instead of fetching from RapidAPI
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Foam runners – mixed size run"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Brand
              </label>
              <Input
                name="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Nike, Adidas, Jordan, etc."
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Category
            </label>
            <Input
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="Slides & Mules"
            />
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

      {/* Order Limits */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-slate-800">Order Limits</h2>
            <p className="text-xs text-slate-500">
              Set minimum and optionally maximum pairs per order.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Minimum order (MOQ)
              </label>
              <Input
                name="moq"
                type="number"
                min={1}
                defaultValue={initialListing?.moq ?? 1}
                required
              />
              <p className="text-[10px] text-slate-500">Buyers must order at least this many</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Maximum per order
              </label>
              <Input
                name="maxOrderQty"
                type="number"
                min={1}
                defaultValue={initialListing?.maxOrderQty ?? ""}
                placeholder="Optional"
              />
              <p className="text-[10px] text-slate-500">Leave empty for no limit</p>
            </div>
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
          <div>
            <h2 className="text-sm font-medium text-slate-800">Pricing</h2>
            <p className="text-xs text-slate-500">
              Set flat or tiered pricing. Tiered pricing encourages bulk orders.
            </p>
          </div>

          {/* Universal Price Input - Shows for Flat and Tiered Percentage modes */}
          {(pricingMode === PricingMode.FLAT || tierPricingType === "PERCENTAGE_OFF") && (
            <div className="w-48 space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Price per pair (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">$</span>
                <Input
                  name={pricingMode === PricingMode.FLAT ? "flatPricePerPair" : "basePricePerPair"}
                  type="number"
                  step="0.01"
                  min="0"
                  value={basePricePerPair}
                  onChange={(e) => setBasePricePerPair(e.target.value)}
                  className="pl-6"
                  placeholder="120.00"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {pricingMode === PricingMode.FLAT 
                  ? "Your selling price per pair" 
                  : "Base price before tier discounts"}
              </p>
            </div>
          )}

          {/* Pricing Mode Toggle */}
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

          <input type="hidden" name="pricingMode" value={pricingMode} />

          {/* Tier Pricing Type Toggle */}
          {pricingMode === PricingMode.TIER && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">Discount Structure</label>
              <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setTierPricingType("FIXED_PRICE")}
                  className={`flex-1 rounded-full px-3 py-1 ${
                    tierPricingType === "FIXED_PRICE"
                      ? "bg-card text-slate-900 shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  Fixed price per tier
                </button>
                <button
                  type="button"
                  onClick={() => setTierPricingType("PERCENTAGE_OFF")}
                  className={`flex-1 rounded-full px-3 py-1 ${
                    tierPricingType === "PERCENTAGE_OFF"
                      ? "bg-card text-slate-900 shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  Percentage off base
                </button>
              </div>
              <input type="hidden" name="tierPricingType" value={tierPricingType} />
            </div>
          )}

          {/* Tier Pricing Tables */}
          {pricingMode === PricingMode.TIER && (
            tierPricingType === "FIXED_PRICE" ? 
              <TierPricingTable tiers={initialListing?.tierPrices ?? []} /> :
              <PercentageTierTable 
                tiers={initialListing?.tierPrices ?? []} 
                basePricePerPair={basePricePerPair}
              />
          )}
        </div>
      </Card>

      {/* Additional Information */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-slate-800">Additional Information (Optional)</h2>
            <p className="text-xs text-slate-500">
              Add seller notes and social links for buyers.
            </p>
          </div>
          
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
      </Card>
      
      {/* Hidden field - all listings support both instant buy and request */}
      <input type="hidden" name="instantBuy" value="true" />

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

function PercentageTierTable({ 
  tiers, 
  basePricePerPair
}: { 
  tiers: ListingTierPrice[], 
  basePricePerPair: string
}) {
  const rowCount = Math.max(tiers.length, 4);
  const rows = Array.from({ length: rowCount }, (_, i) => tiers[i]);
  const basePrice = parseFloat(basePricePerPair) || 0;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-[11px] font-medium text-slate-600">
        <div>Min qty</div>
        <div>Discount %</div>
        <div>Price/pair</div>
      </div>
      <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
        {rows.map((tier, index) => {
          const discount = parseFloat(tier?.discountPercent?.toString() || "0");
          const calculatedPrice = basePrice * (1 - discount / 100);

          return (
            <div key={index} className="grid grid-cols-3 gap-2">
              <Input
                name={`tiers[${index}].minQty`}
                type="number"
                min={1}
                defaultValue={tier?.minQty ?? ""}
                placeholder="5"
                className="h-9 text-xs"
              />
              <div className="relative">
                <Input
                  name={`tiers[${index}].discountPercent`}
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue={tier?.discountPercent?.toString() ?? ""}
                  placeholder="10"
                  className="h-9 pr-6 text-xs"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">%</span>
              </div>
              <div className="flex items-center text-xs font-medium text-slate-700">
                ${calculatedPrice.toFixed(2)}
              </div>
              <input type="hidden" name={`tiers[${index}].pricingType`} value="PERCENTAGE_OFF" />
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500">
        Discounts calculated from base price. Best tier for order quantity will be applied.
      </p>
    </div>
  );
}

