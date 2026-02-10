"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InventoryMode, ListingStatus } from "@prisma/client";

export async function duplicateListing(formData: FormData) {
  const listingId = Number(formData.get("listingId"));
  const copyInventory = formData.get("copyInventory") === "true";
  const source = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      images: true,
      sizes: true,
      tierPrices: true,
    },
  });

  if (!source) throw new Error("Listing not found");

  const newListing = await prisma.$transaction(async (tx) => {
    const created = await tx.listing.create({
      data: {
        title: `${source.title} (copy)`,
        category: source.category,
        moq: source.moq,
        status: ListingStatus.DRAFT,
        inventoryMode: source.inventoryMode,
        pricingMode: source.pricingMode,
        flatPricePerPair: source.flatPricePerPair,
        totalPairs: copyInventory ? source.totalPairs : null,
        instantBuy: source.instantBuy,
        sellerNotes: source.sellerNotes,
        stockXLink: source.stockXLink,
        discordLink: source.discordLink,
        instagramLink: source.instagramLink,
      },
    });

    for (const img of source.images) {
      await tx.listingImage.create({
        data: {
          listingId: created.id,
          url: img.url,
          sortOrder: img.sortOrder,
        },
      });
    }

    if (source.inventoryMode === InventoryMode.SIZE_RUN && source.sizes.length) {
      await tx.listingSize.createMany({
        data: source.sizes.map((s) => ({
          listingId: created.id,
          sizeLabel: s.sizeLabel,
          quantity: copyInventory ? s.quantity : 0,
          soldOut: copyInventory ? s.soldOut : false,
        })),
      });
    } else if (source.inventoryMode === InventoryMode.MIXED_BATCH) {
      if (copyInventory && source.totalPairs != null) {
        await tx.listing.update({
          where: { id: created.id },
          data: { totalPairs: source.totalPairs },
        });
      }
    }

    for (const tier of source.tierPrices) {
      await tx.listingTierPrice.create({
        data: {
          listingId: created.id,
          minQty: tier.minQty,
          pricePerPair: tier.pricePerPair,
        },
      });
    }

    return created;
  });

  revalidatePath("/admin/listings");
  redirect(`/admin/listings/${newListing.id}/edit`);
}

export async function markListingSoldOut(formData: FormData) {
  const listingId = Number(formData.get("listingId"));
  await prisma.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.SOLD_OUT },
    });
    await tx.listingSize.updateMany({
      where: { listingId },
      data: { soldOut: true, quantity: 0 },
    });
  });
  revalidatePath("/admin/listings");
}

export async function archiveListing(formData: FormData) {
  const listingId = Number(formData.get("listingId"));
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: ListingStatus.ARCHIVED },
  });
  revalidatePath("/admin/listings");
}

export async function archiveListingAndRedirect(formData: FormData) {
  await archiveListing(formData);
  redirect("/admin/listings");
}

export async function deleteListing(formData: FormData) {
  const listingId = Number(formData.get("listingId"));
  
  // Delete listing and all related data (cascade delete configured in schema)
  await prisma.listing.delete({
    where: { id: listingId },
  });
  
  revalidatePath("/admin/listings");
  redirect("/admin/listings");
}
