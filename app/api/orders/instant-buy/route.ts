import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import { calculateOrderTotal } from "@/lib/pricing";
import { OrderStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const buyerId = await getBuyerId();
    if (!buyerId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId, quantity } = body;

    if (!listingId || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the listing
    const listing = await prisma.listing.findUnique({
      where: { id: Number(listingId) },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        sizes: true,
        tierPrices: { orderBy: { minQty: "asc" } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (!listing.instantBuy) {
      return NextResponse.json({ error: "This listing is not available for instant buy" }, { status: 400 });
    }

    // Calculate pricing
    const orderTotal = calculateOrderTotal({
      listing,
      tiers: listing.tierPrices,
      totalPairs: Number(quantity),
    });

    // Create order items based on inventory mode
    const orderItems = listing.inventoryMode === "SIZE_RUN"
      ? listing.sizes.filter(s => !s.soldOut).map(size => ({
          sizeLabel: size.sizeLabel,
          quantity: size.quantity,
          pricePerPair: orderTotal.pricePerPair,
        }))
      : [{
          sizeLabel: null,
          quantity: Number(quantity),
          pricePerPair: orderTotal.pricePerPair,
        }];

    // Create the order
    const order = await prisma.order.create({
      data: {
        buyerId,
        listingId: listing.id,
        status: OrderStatus.CONFIRMED, // Instant buy orders start as CONFIRMED
        totalPairs: orderTotal.totalPairs,
        totalAmount: orderTotal.totalAmount,
        items: {
          create: orderItems,
        },
      },
    });

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "http://localhost:3000";
    
    const checkoutResponse = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });

    if (!checkoutResponse.ok) {
      // If checkout creation fails, delete the order
      await prisma.order.delete({ where: { id: order.id } });
      const error = await checkoutResponse.json();
      throw new Error(error.error || "Failed to create checkout session");
    }

    const { url } = await checkoutResponse.json();

    return NextResponse.json({ checkoutUrl: url });
  } catch (error) {
    console.error("Instant buy error:", error);
    return NextResponse.json(
      { error: "Failed to process instant buy" },
      { status: 500 }
    );
  }
}
