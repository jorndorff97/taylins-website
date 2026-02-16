import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            brand: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        brand: true,
        category: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      take: 8,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Search suggestion error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}
