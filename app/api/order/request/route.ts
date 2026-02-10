import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import { SenderType } from "@prisma/client";

export async function POST(request: Request) {
  const buyerId = await getBuyerId();
  if (!buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const listingId = Number(formData.get("listingId"));
  const totalPairs = Number(formData.get("totalPairs"));
  const totalAmount = Number(formData.get("totalAmount"));
  const notes = String(formData.get("notes") ?? "");
  const itemsJson = String(formData.get("items") ?? "[]");

  if (!listingId || totalPairs <= 0 || totalAmount <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let items: { sizeLabel: string | null; quantity: number; pricePerPair: number }[];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { sizes: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        buyerId,
        listingId,
        status: "PENDING",
        totalPairs,
        totalAmount,
        notes: notes || null,
      },
    });

    for (const item of items) {
      if (item.quantity > 0) {
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            sizeLabel: item.sizeLabel ?? null,
            quantity: item.quantity,
            pricePerPair: item.pricePerPair,
          },
        });
      }
    }

    const messageBody = notes
      ? `Order request: ${totalPairs} pairs, $${totalAmount.toLocaleString()}.\n\nNotes: ${notes}`
      : `Order request: ${totalPairs} pairs, $${totalAmount.toLocaleString()}.`;

    await tx.orderMessage.create({
      data: {
        orderId: created.id,
        senderType: SenderType.BUYER,
        body: messageBody,
      },
    });

    return created;
  });

  return NextResponse.json({ orderId: order.id });
}
