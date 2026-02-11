import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CACHE_DURATION_HOURS = 24; // Refresh prices every 24 hours

export async function GET(req: NextRequest) {
  try {
    const listingId = req.nextUrl.searchParams.get("listingId");
    
    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }

    // Get listing with current cache
    const listing = await prisma.listing.findUnique({
      where: { id: Number(listingId) },
      select: {
        id: true,
        productSKU: true,
        stockXPrice: true,
        stockXPriceUpdatedAt: true,
      },
    });

    if (!listing || !listing.productSKU) {
      return NextResponse.json({ error: "Listing not found or missing SKU" }, { status: 404 });
    }

    // Check if cached price is still fresh
    const now = new Date();
    const cacheAge = listing.stockXPriceUpdatedAt
      ? (now.getTime() - new Date(listing.stockXPriceUpdatedAt).getTime()) / (1000 * 60 * 60)
      : Infinity;

    if (listing.stockXPrice && cacheAge < CACHE_DURATION_HOURS) {
      // Return cached price
      return NextResponse.json({
        price: Number(listing.stockXPrice),
        cached: true,
        updatedAt: listing.stockXPriceUpdatedAt,
      });
    }

    // Fetch fresh price from RapidAPI using productprices endpoint
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!,
      },
    };

    const response = await fetch(
      `https://${process.env.RAPIDAPI_HOST}/productprices?styleid=${encodeURIComponent(listing.productSKU)}`,
      options
    );

    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the price from response (adjust based on actual API response)
    // Common fields: lowestAsk, retailPrice, price
    const price = data.lowestAsk || data.price || data.retailPrice || null;

    if (price) {
      // Update cache in database
      await prisma.listing.update({
        where: { id: Number(listingId) },
        data: {
          stockXPrice: price,
          stockXPriceUpdatedAt: now,
        },
      });

      return NextResponse.json({
        price: Number(price),
        cached: false,
        updatedAt: now,
      });
    }

    return NextResponse.json({ error: "Price not found" }, { status: 404 });
  } catch (error) {
    console.error("StockX price fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    );
  }
}
