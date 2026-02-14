import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ListingForm } from "@/components/admin/listings/ListingForm";
import { InventoryMode, ListingStatus, PricingMode, TierPricingType } from "@prisma/client";
import { fetchStockXPrice } from "@/lib/fetch-stockx-price";

export default function NewListingPage() {
  async function handleSubmit(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "");
    const brand = String(formData.get("brand") ?? "").trim() || null;
    const category = String(formData.get("category") ?? "");
    const moq = Number(formData.get("moq") ?? 0);
    const maxOrderQty = formData.get("maxOrderQty") ? Number(formData.get("maxOrderQty")) : null;
    const tierPricingType = formData.get("tierPricingType")?.toString() || "FIXED_PRICE";
    const inventoryMode = (formData.get("inventoryMode") ??
      InventoryMode.SIZE_RUN) as InventoryMode;
    const pricingMode = (formData.get("pricingMode") ??
      PricingMode.FLAT) as PricingMode;
    const instantBuy = formData.get("instantBuy") === "true";
    const sellerNotes = String(formData.get("sellerNotes") ?? "").trim() || null;
    const stockXLink = String(formData.get("stockXLink") ?? "").trim() || null;
    const productSKU = String(formData.get("productSKU") ?? "").trim() || null;
    const manualStockXPrice = formData.get("manualStockXPrice") 
      ? Number(formData.get("manualStockXPrice")) 
      : null;
    const discordLink = String(formData.get("discordLink") ?? "").trim() || null;
    const instagramLink = String(formData.get("instagramLink") ?? "").trim() || null;
    const intent = String(formData.get("intent") ?? "draft");

    // Debug: Log what we received from the form
    console.log('[FORM DATA] Received from form:', {
      productSKU,
      manualStockXPrice,
      intent,
      hasProductSKU: !!productSKU,
      hasManualPrice: !!manualStockXPrice,
    });

    // Get pricing based on mode
    const flatPriceRaw = formData.get("flatPricePerPair");
    const basePriceRaw = formData.get("basePricePerPair");
    
    // Determine the actual flat price and base price
    let flatPricePerPair: number | null = null;
    let basePricePerPair: number | null = null;
    
    if (pricingMode === PricingMode.FLAT) {
      // For flat pricing, the form sends "flatPricePerPair"
      flatPricePerPair = flatPriceRaw ? Number(flatPriceRaw) : null;
      console.log('[LISTING CREATE] Flat pricing mode - flatPricePerPair:', flatPricePerPair);
    } else {
      // For tier pricing, the form sends "basePricePerPair"
      basePricePerPair = basePriceRaw ? Number(basePriceRaw) : null;
      console.log('[LISTING CREATE] Tier pricing mode - basePricePerPair:', basePricePerPair);
    }

    // Collect image URLs
    const imageUrls: string[] = [];
    for (let i = 0; i < 20; i++) {
      const url = formData.get(`images[${i}]`);
      if (url) imageUrls.push(String(url));
    }

    if (!title || !category || !moq) {
      throw new Error("Missing required fields");
    }

    const status =
      intent === "publish" ? ListingStatus.ACTIVE : ListingStatus.DRAFT;

    // Fetch StockX price automatically if SKU is provided and no manual override
    let fetchedStockXPrice = null;
    let stockXPriceTimestamp = null;
    let stockXFetchError = null;
    
    console.log('[STOCKX FETCH] Conditions check:', {
      hasProductSKU: !!productSKU,
      productSKU,
      hasManualPrice: !!manualStockXPrice,
      willAttemptFetch: !!(productSKU && !manualStockXPrice),
    });
    
    if (productSKU && !manualStockXPrice) {
      console.log(`[STOCKX FETCH] Attempting to fetch price for SKU: ${productSKU}`);
      try {
        fetchedStockXPrice = await fetchStockXPrice(productSKU);
        if (fetchedStockXPrice) {
          stockXPriceTimestamp = new Date();
          console.log(`[STOCKX FETCH] ✓ Successfully fetched: $${fetchedStockXPrice}`);
        } else {
          console.log(`[STOCKX FETCH] ✗ No price found for SKU: ${productSKU}`);
          stockXFetchError = "No price found for this SKU";
        }
      } catch (error) {
        console.error(`[STOCKX FETCH] ✗ Error fetching price:`, error);
        stockXFetchError = error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      console.log('[STOCKX FETCH] Skipping fetch:', 
        !productSKU ? 'No SKU provided' : 'Manual price override is set'
      );
    }

    const finalStockXPrice = manualStockXPrice || fetchedStockXPrice;
    
    console.log('[LISTING CREATE] Final values:', {
      title,
      inventoryMode,
      pricingMode,
      flatPricePerPair,
      basePricePerPair,
      stockXPrice: finalStockXPrice,
      productSKU,
      status,
    });

    const listing = await prisma.$transaction(async (tx) => {
      const created = await tx.listing.create({
        data: {
          title,
          brand,
          category,
          moq,
          maxOrderQty,
          basePricePerPair,
          flatPricePerPair,  // Always set in initial create
          inventoryMode,
          pricingMode,
          status,
          instantBuy,
          sellerNotes,
          stockXLink,
          productSKU,
          stockXPrice: finalStockXPrice,
          stockXPriceUpdatedAt: manualStockXPrice ? new Date() : stockXPriceTimestamp,
          discordLink,
          instagramLink,
        },
      });

      // Images
      if (imageUrls.length > 0) {
        await tx.listingImage.createMany({
          data: imageUrls.map((url, idx) => ({
            listingId: created.id,
            url,
            sortOrder: idx,
          })),
        });
      }

      // Sizes
      if (inventoryMode === InventoryMode.SIZE_RUN) {
        const sizes: { sizeLabel: string; quantity: number; soldOut: boolean }[] =
          [];

        for (let i = 0; i < 12; i++) {
          const sizeLabel = formData.get(`sizes[${i}].sizeLabel`);
          const quantityRaw = formData.get(`sizes[${i}].quantity`);
          const soldOutRaw = formData.get(`sizes[${i}].soldOut`);

          if (!sizeLabel) continue;
          const label = String(sizeLabel);
          const quantity = Number(quantityRaw ?? 0);
          const soldOut = soldOutRaw === "on";

          sizes.push({ sizeLabel: label, quantity, soldOut });
        }

        if (sizes.length) {
          await tx.listingSize.createMany({
            data: sizes.map((size) => ({
              listingId: created.id,
              ...size,
            })),
          });
        }
      } else {
        const totalPairsRaw = formData.get("totalPairs");
        const totalPairs = totalPairsRaw ? Number(totalPairsRaw) : null;

        if (totalPairs !== null) {
          await tx.listing.update({
            where: { id: created.id },
            data: { totalPairs },
          });
        }
      }

      // Tiers
      if (pricingMode === PricingMode.TIER) {
        const tiers: Array<{ minQty: number; pricePerPair?: number; discountPercent?: number; pricingType: TierPricingType }> = [];
        
        for (let i = 0; i < 8; i++) {
          const minQtyRaw = formData.get(`tiers[${i}].minQty`);
          if (!minQtyRaw) continue;
          const minQty = Number(minQtyRaw);
          if (!minQty) continue;

          if (tierPricingType === "PERCENTAGE_OFF") {
            const discountRaw = formData.get(`tiers[${i}].discountPercent`);
            if (discountRaw) {
              const discountPercent = Number(discountRaw);
              tiers.push({ minQty, discountPercent, pricingType: TierPricingType.PERCENTAGE_OFF });
            }
          } else {
            const priceRaw = formData.get(`tiers[${i}].pricePerPair`);
            if (priceRaw) {
              const pricePerPair = Number(priceRaw);
              if (pricePerPair) {
                tiers.push({ minQty, pricePerPair, pricingType: TierPricingType.FIXED_PRICE });
              }
            }
          }
        }

        if (tiers.length) {
          await tx.listingTierPrice.createMany({
            data: tiers.map((tier) => ({
              listingId: created.id,
              ...tier,
            })),
          });
          console.log(`[LISTING CREATE] Created ${tiers.length} tier prices`);
        }
      }

      console.log(`[LISTING CREATE] ✓ Listing created successfully:`, {
        id: created.id,
        title: created.title,
        flatPricePerPair: created.flatPricePerPair,
        stockXPrice: created.stockXPrice,
        willShowOnHero: !!(created.stockXPrice && created.flatPricePerPair && imageUrls.length > 0),
      });

      return created;
    });

    revalidatePath("/admin/listings");
    redirect("/admin/listings");
  }

  return (
    <>
      <AdminHeader title="Create listing" />
      <main className="flex-1 bg-background px-6 pb-10 pt-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <ListingForm mode="create" onSubmit={handleSubmit} />
        </div>
      </main>
    </>
  );
}
