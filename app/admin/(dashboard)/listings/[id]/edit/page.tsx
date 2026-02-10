import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { archiveListingAndRedirect, deleteListing } from "../../actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ListingForm } from "@/components/admin/listings/ListingForm";
import { Button } from "@/components/ui/button";
import { InventoryMode, ListingStatus, PricingMode } from "@prisma/client";

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
    },
  });

  if (!listing) notFound();

  async function handleSubmit(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "");
    const category = String(formData.get("category") ?? "");
    const moq = Number(formData.get("moq") ?? 0);
    const intent = String(formData.get("intent") ?? "draft");
    const inventoryMode = (formData.get("inventoryMode") ??
      InventoryMode.SIZE_RUN) as InventoryMode;
    const pricingMode = (formData.get("pricingMode") ??
      PricingMode.FLAT) as PricingMode;
    const instantBuy = formData.get("instantBuy") === "true";
    const sellerNotes = String(formData.get("sellerNotes") ?? "").trim() || null;
    const stockXLink = String(formData.get("stockXLink") ?? "").trim() || null;
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

    await prisma.$transaction(async (tx) => {
      await tx.listing.update({
        where: { id },
        data: {
          title,
          category,
          moq,
          status,
          inventoryMode,
          pricingMode,
          instantBuy,
          sellerNotes,
          stockXLink,
          discordLink,
          instagramLink,
        },
      });

      // Images - delete all and recreate
      await tx.listingImage.deleteMany({ where: { listingId: id } });
      if (imageUrls.length > 0) {
        await tx.listingImage.createMany({
          data: imageUrls.map((url, idx) => ({
            listingId: id,
            url,
            sortOrder: idx,
          })),
        });
      }

      // Inventory
      await tx.listingSize.deleteMany({ where: { listingId: id } });
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
            data: sizes.map((s) => ({ listingId: id, ...s })),
          });
        }
      } else {
        const totalPairsRaw = formData.get("totalPairs");
        const totalPairs = totalPairsRaw ? Number(totalPairsRaw) : null;
        await tx.listing.update({
          where: { id },
          data: { totalPairs },
        });
      }

      // Pricing
      await tx.listingTierPrice.deleteMany({ where: { listingId: id } });
      if (pricingMode === PricingMode.FLAT) {
        const flatPriceRaw = formData.get("flatPricePerPair");
        await tx.listing.update({
          where: { id },
          data: {
            flatPricePerPair: flatPriceRaw ? Number(flatPriceRaw) : null,
          },
        });
      } else {
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
            data: tiers.map((tier) => ({ listingId: id, ...tier })),
          });
        }
      }
    });

    revalidatePath("/admin/listings");
    redirect("/admin/listings");
  }

  const listingForForm = {
    ...listing,
    sizes: listing.sizes,
    tierPrices: listing.tierPrices,
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
            <form action={deleteListing} className="ml-auto">
              <input type="hidden" name="listingId" value={id} />
              <Button 
                type="submit" 
                variant="ghost" 
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={(e) => {
                  if (!confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) {
                    e.preventDefault();
                  }
                }}
              >
                Delete listing
              </Button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
