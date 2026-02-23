import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { archiveListingAndRedirect } from "../../actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ListingForm } from "@/components/admin/listings/ListingForm";
import { DeleteListingButton } from "@/components/admin/listings/DeleteListingButton";
import { Button } from "@/components/ui/button";
import { InventoryMode, ListingStatus, PricingMode, TierPricingType } from "@prisma/client";
import { fetchStockXPrice } from "@/lib/fetch-stockx-price";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!id) notFound();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      sizes: true,
      tierPrices: { orderBy: { minQty: "asc" } },
      shippingOptions: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!listing) notFound();

  async function handleSubmit(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "");
    const brand = String(formData.get("brand") ?? "").trim() || null;
    const category = String(formData.get("category") ?? "");
    const moq = Number(formData.get("moq") ?? 0);
    const maxOrderQty = formData.get("maxOrderQty") ? Number(formData.get("maxOrderQty")) : null;
    const basePricePerPair = formData.get("basePricePerPair") ? Number(formData.get("basePricePerPair")) : null;
    const tierPricingType = formData.get("tierPricingType")?.toString() || "FIXED_PRICE";
    const intent = String(formData.get("intent") ?? "draft");
    const inventoryMode = (formData.get("inventoryMode") ??
      InventoryMode.SIZE_RUN) as InventoryMode;
    const pricingMode = (formData.get("pricingMode") ??
      PricingMode.FLAT) as PricingMode;
    const instantBuy = formData.get("instantBuy") === "true";
    const sellerNotes = String(formData.get("sellerNotes") ?? "").trim() || null;
    const stockXLink = String(formData.get("stockXLink") ?? "").trim() || null;
    const productSKU = String(formData.get("productSKU") ?? "").trim() || null;
    const manualStockXPriceRaw = formData.get("manualStockXPrice");
    const manualStockXPrice = manualStockXPriceRaw 
      ? Math.round(Number(manualStockXPriceRaw) * 100) / 100
      : null;
    const discordLink = String(formData.get("discordLink") ?? "").trim() || null;
    const instagramLink = String(formData.get("instagramLink") ?? "").trim() || null;

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
    let fetchedStockXPrice: number | null = null;
    let stockXPriceTimestamp: Date | null = null;
    
    if (productSKU && !manualStockXPrice) {
      console.log(`Fetching StockX price for SKU: ${productSKU}`);
      const apiPrice = await fetchStockXPrice(productSKU);
      if (apiPrice) {
        fetchedStockXPrice = Math.round(apiPrice * 100) / 100;
        stockXPriceTimestamp = new Date();
        console.log(`Successfully fetched StockX price: $${fetchedStockXPrice}`);
      } else {
        console.log(`Could not fetch StockX price for SKU: ${productSKU}`);
      }
    }

    // Update listing
    await prisma.listing.update({
      where: { id },
      data: {
        title,
        brand,
        category,
        moq,
        maxOrderQty,
        basePricePerPair,
        status,
        inventoryMode,
        pricingMode,
        instantBuy,
        sellerNotes,
        stockXLink,
        productSKU,
        stockXPrice: manualStockXPrice ?? fetchedStockXPrice ?? null,
        stockXPriceManual: !!manualStockXPrice,
        stockXPriceUpdatedAt: manualStockXPrice
          ? new Date()
          : fetchedStockXPrice
            ? stockXPriceTimestamp
            : null,
        discordLink,
        instagramLink,
      },
    });

    // Images - delete all and recreate
    await prisma.listingImage.deleteMany({ where: { listingId: id } });
    if (imageUrls.length > 0) {
      await prisma.listingImage.createMany({
        data: imageUrls.map((url, idx) => ({
          listingId: id,
          url,
          sortOrder: idx,
        })),
      });
    }

    // Inventory
    await prisma.listingSize.deleteMany({ where: { listingId: id } });
    if (inventoryMode === InventoryMode.SIZE_RUN) {
      const sizes: { sizeLabel: string; quantity: number; minOrder: number | null; soldOut: boolean }[] =
        [];
      for (let i = 0; i < 50; i++) {
        const sizeLabel = formData.get(`sizes[${i}].sizeLabel`);
        const quantityRaw = formData.get(`sizes[${i}].quantity`);
        const minOrderRaw = formData.get(`sizes[${i}].minOrder`);
        const soldOutRaw = formData.get(`sizes[${i}].soldOut`);
        if (!sizeLabel) continue;
        const label = String(sizeLabel);
        const quantity = Number(quantityRaw ?? 0);
        const minOrderValue = minOrderRaw ? Number(minOrderRaw) : null;
        const minOrder = minOrderValue === moq ? null : minOrderValue;
        const soldOut = soldOutRaw === "on";
        sizes.push({ sizeLabel: label, quantity, minOrder, soldOut });
      }
      if (sizes.length) {
        await prisma.listingSize.createMany({
          data: sizes.map((s) => ({ listingId: id, ...s })),
        });
      }
    } else {
      const totalPairsRaw = formData.get("totalPairs");
      const totalPairs = totalPairsRaw ? Number(totalPairsRaw) : null;
      await prisma.listing.update({
        where: { id },
        data: { totalPairs },
      });
    }

    // Pricing
    await prisma.listingTierPrice.deleteMany({ where: { listingId: id } });
    if (pricingMode === PricingMode.FLAT) {
      const flatPriceRaw = formData.get("flatPricePerPair");
      await prisma.listing.update({
        where: { id },
        data: {
          flatPricePerPair: flatPriceRaw ? Number(flatPriceRaw) : null,
        },
      });
    } else {
      const tiers: Array<{
        minQty: number;
        pricePerPair?: number;
        discountPercent?: number;
        pricingType: "FIXED_PRICE" | "PERCENTAGE_OFF";
      }> = [];
      
      for (let i = 0; i < 8; i++) {
        const minQtyRaw = formData.get(`tiers[${i}].minQty`);
        if (!minQtyRaw) continue;
        const minQty = Number(minQtyRaw);
        
        if (tierPricingType === "PERCENTAGE_OFF") {
          const discountRaw = formData.get(`tiers[${i}].discountPercent`);
          if (!discountRaw) continue;
          const discountPercent = Number(discountRaw);
          if (!minQty || discountPercent === undefined) continue;
          tiers.push({ 
            minQty, 
            discountPercent, 
            pricingType: "PERCENTAGE_OFF" as const
          });
        } else {
          const priceRaw = formData.get(`tiers[${i}].pricePerPair`);
          if (!priceRaw) continue;
          const pricePerPair = Number(priceRaw);
          if (!minQty || !pricePerPair) continue;
          tiers.push({ 
            minQty, 
            pricePerPair, 
            pricingType: "FIXED_PRICE" as const
          });
        }
      }
      
      if (tiers.length) {
        await prisma.listingTierPrice.createMany({
          data: tiers.map((tier) => ({ 
            listingId: id, 
            minQty: tier.minQty,
            pricePerPair: tier.pricePerPair ?? null,
            discountPercent: tier.discountPercent ?? null,
            pricingType: tier.pricingType
          })),
        });
      }
    }

    // Shipping Options - delete all and recreate
    await prisma.shippingOption.deleteMany({ where: { listingId: id } });
    const shippingOptions: { label: string; price: number; enabled: boolean; sortOrder: number }[] = [];
    for (let i = 0; i < 20; i++) {
      const label = formData.get(`shipping[${i}].label`);
      const priceRaw = formData.get(`shipping[${i}].price`);
      const enabledRaw = formData.get(`shipping[${i}].enabled`);
      if (!label) continue;
      const labelStr = String(label).trim();
      if (!labelStr) continue;
      shippingOptions.push({
        label: labelStr,
        price: priceRaw ? Number(priceRaw) : 0,
        enabled: enabledRaw === "true",
        sortOrder: i,
      });
    }
    if (shippingOptions.length > 0) {
      await prisma.shippingOption.createMany({
        data: shippingOptions.map((opt) => ({
          listingId: id,
          ...opt,
        })),
      });
    }

    revalidatePath("/admin/listings");
    redirect("/admin/listings");
  }

  const listingForForm = {
    ...listing,
    flatPricePerPair: listing.flatPricePerPair ? Number(listing.flatPricePerPair) : null,
    basePricePerPair: listing.basePricePerPair ? Number(listing.basePricePerPair) : null,
    costPerPair: listing.costPerPair ? Number(listing.costPerPair) : null,
    stockXPrice: listing.stockXPrice ? Number(listing.stockXPrice) : null,
    sizes: listing.sizes,
    tierPrices: listing.tierPrices.map(tp => ({
      ...tp,
      pricePerPair: tp.pricePerPair ? Number(tp.pricePerPair) : null,
      discountPercent: tp.discountPercent ? Number(tp.discountPercent) : null,
    })),
    shippingOptions: listing.shippingOptions.map(so => ({
      ...so,
      price: Number(so.price),
    })),
  };

  const isArchived = listing.status === "ARCHIVED";

  return (
    <>
      <AdminHeader title="Edit listing" />
      <main className="flex-1 bg-background px-6 pb-10 pt-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <ListingForm
            initialListing={listingForForm}
            mode="edit"
            onSubmit={handleSubmit}
          />
          <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
            {!isArchived && (
              <form action={archiveListingAndRedirect}>
                <input type="hidden" name="listingId" value={id} />
                <Button type="submit" variant="ghost" className="text-slate-500 hover:text-slate-700">
                  Archive listing
                </Button>
              </form>
            )}
            <DeleteListingButton listingId={id} />
          </div>
        </div>
      </main>
    </>
  );
}
