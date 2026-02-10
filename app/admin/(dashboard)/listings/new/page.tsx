import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ListingForm } from "@/components/admin/listings/ListingForm";
import { InventoryMode, ListingStatus, PricingMode } from "@prisma/client";

export default function NewListingPage() {
  async function handleSubmit(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "");
    const category = String(formData.get("category") ?? "");
    const moq = Number(formData.get("moq") ?? 0);
    const inventoryMode = (formData.get("inventoryMode") ??
      InventoryMode.SIZE_RUN) as InventoryMode;
    const pricingMode = (formData.get("pricingMode") ??
      PricingMode.FLAT) as PricingMode;
    const instantBuy = formData.get("instantBuy") === "true";
    const sellerNotes = String(formData.get("sellerNotes") ?? "").trim() || null;
    const stockXLink = String(formData.get("stockXLink") ?? "").trim() || null;
    const discordLink = String(formData.get("discordLink") ?? "").trim() || null;
    const instagramLink = String(formData.get("instagramLink") ?? "").trim() || null;
    const intent = String(formData.get("intent") ?? "draft");

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

    const listing = await prisma.$transaction(async (tx) => {
      const created = await tx.listing.create({
        data: {
          title,
          category,
          moq,
          inventoryMode,
          pricingMode,
          status,
          instantBuy,
          sellerNotes,
          stockXLink,
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
        const tiers: { minQty: number; pricePerPair: number }[] = [];
        for (let i = 0; i < 8; i++) {
          const minQtyRaw = formData.get(`tiers[${i}].minQty`);
          const priceRaw = formData.get(`tiers[${i}].pricePerPair`);
          if (!minQtyRaw || !priceRaw) continue;
          const minQty = Number(minQtyRaw);
          const pricePerPair = Number(priceRaw);
          if (!minQty || !pricePerPair) continue;
          tiers.push({ minQty, pricePerPair });
        }

        if (tiers.length) {
          await tx.listingTierPrice.createMany({
            data: tiers.map((tier) => ({
              listingId: created.id,
              ...tier,
            })),
          });
        }
      } else {
        const flatPriceRaw = formData.get("flatPricePerPair");
        if (flatPriceRaw) {
          await tx.listing.update({
            where: { id: created.id },
            data: {
              flatPricePerPair: Number(flatPriceRaw),
            },
          });
        }
      }

      return created;
    });

    revalidatePath("/admin/listings");
    redirect(`/admin/listings/${listing.id}/edit`);
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
