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

    // Fetch fresh price from RapidAPI using productprice endpoint
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!,
      },
    };

    const response = await fetch(
      `https://${process.env.RAPIDAPI_HOST}/productprice?styleid=${encodeURIComponent(listing.productSKU)}`,
      options
    );

    if (!response.ok) {
      console.error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('RapidAPI error response:', errorText);
      throw new Error(`RapidAPI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('RapidAPI response data:', JSON.stringify(data, null, 2));
    
    // Parse the price from response based on actual API structure
    let price = null;
    
    // Priority 1: Check lowestResellPrice structure (from API response)
    if (data.lowestResellPrice?.stockX) price = data.lowestResellPrice.stockX;
    else if (data.lowestResellPrice?.goat) price = data.lowestResellPrice.goat;
    else if (data.lowestResellPrice?.flightClub) price = data.lowestResellPrice.flightClub;
    else if (data.lowestResellPrice?.stadiumGoods) price = data.lowestResellPrice.stadiumGoods;
    // Priority 2: Try direct properties
    else if (data.lowestAsk) price = data.lowestAsk;
    else if (data.price) price = data.price;
    else if (data.retailPrice) price = data.retailPrice;
    // Priority 3: Try nested structures
    else if (data.Product?.lowestAsk) price = data.Product.lowestAsk;
    else if (data.Product?.price) price = data.Product.price;
    else if (data.sneaker?.lowestAsk) price = data.sneaker.lowestAsk;
    else if (data.sneaker?.price) price = data.sneaker.price;
    // Priority 4: Try market data
    else if (data.market?.lowestAsk) price = data.market.lowestAsk;
    else if (data.market?.lastSale) price = data.market.lastSale;
    
    console.log('Extracted price:', price);

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
