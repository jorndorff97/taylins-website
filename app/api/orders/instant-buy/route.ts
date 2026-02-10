import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import { calculateOrderTotal } from "@/lib/pricing";
import { OrderStatus, InventoryMode } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const buyerId = await getBuyerId();
    if (!buyerId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId, quantity, items } = body;

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
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

    let totalPairs = 0;
    let orderItems: { sizeLabel: string | null; quantity: number; pricePerPair: number }[] = [];

    if (listing.inventoryMode === InventoryMode.SIZE_RUN) {
      // Handle SIZE_RUN mode with items array
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "Items array required for SIZE_RUN mode" }, { status: 400 });
      }

      // Calculate total pairs and validate inventory
      for (const item of items) {
        const size = listing.sizes.find((s) => s.id === item.sizeId);
        if (!size) {
          return NextResponse.json({ error: `Invalid size ID: ${item.sizeId}` }, { status: 400 });
        }
        if (size.soldOut || size.quantity === 0) {
          return NextResponse.json({ error: `Size ${size.sizeLabel} is sold out` }, { status: 400 });
        }
        if (item.quantity > size.quantity) {
          return NextResponse.json(
            { error: `Requested ${item.quantity} for size ${size.sizeLabel}, but only ${size.quantity} available` },
            { status: 400 }
          );
        }
        totalPairs += item.quantity;
      }

      // Calculate pricing
      const orderTotal = calculateOrderTotal({
        listing,
        tiers: listing.tierPrices,
        totalPairs,
      });

      // Build order items
      orderItems = items.map((item) => ({
        sizeLabel: item.sizeLabel,
        quantity: item.quantity,
        pricePerPair: orderTotal.pricePerPair,
      }));
    } else {
      // Handle MIXED_BATCH mode
      if (!quantity) {
        return NextResponse.json({ error: "Quantity required for MIXED_BATCH mode" }, { status: 400 });
      }

      totalPairs = Number(quantity);

      // Validate inventory
      if (totalPairs > (listing.totalPairs ?? 0)) {
        return NextResponse.json(
          { error: `Requested ${totalPairs} pairs, but only ${listing.totalPairs} available` },
          { status: 400 }
        );
      }

      // Calculate pricing
      const orderTotal = calculateOrderTotal({
        listing,
        tiers: listing.tierPrices,
        totalPairs,
      });

      orderItems = [{
        sizeLabel: null,
        quantity: totalPairs,
        pricePerPair: orderTotal.pricePerPair,
      }];
    }

    // Validate MOQ
    if (totalPairs < listing.moq) {
      return NextResponse.json(
        { error: `Minimum order quantity is ${listing.moq} pairs` },
        { status: 400 }
      );
    }

    // Calculate final total
    const orderTotal = calculateOrderTotal({
      listing,
      tiers: listing.tierPrices,
      totalPairs,
    });

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
