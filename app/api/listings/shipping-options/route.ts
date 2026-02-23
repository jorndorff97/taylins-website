import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const listingIdsParam = url.searchParams.get("ids");

    if (!listingIdsParam) {
      return NextResponse.json({ error: "Missing listing IDs" }, { status: 400 });
    }

    const listingIds = listingIdsParam.split(",").map(Number).filter(Boolean);

    if (listingIds.length === 0) {
      return NextResponse.json({ shippingOptions: {} });
    }

    const listings = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: {
        id: true,
        shippingOptions: {
          where: { enabled: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            label: true,
            price: true,
          },
        },
      },
    });

    const shippingOptions: Record<number, { id: number; label: string; price: number }[]> = {};
    for (const listing of listings) {
      shippingOptions[listing.id] = listing.shippingOptions.map((opt) => ({
        id: opt.id,
        label: opt.label,
        price: Number(opt.price),
      }));
    }

    return NextResponse.json({ shippingOptions });
  } catch (error) {
    console.error("Error fetching shipping options:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping options" },
      { status: 500 }
    );
  }
}
