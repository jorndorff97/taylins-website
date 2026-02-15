import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";

export async function GET() {
  try {
    const buyerId = await getBuyerId();
    
    if (!buyerId) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const result = await prisma.conversation.aggregate({
      where: {
        buyerId,
        status: "ACTIVE",
      },
      _sum: {
        unreadByBuyer: true,
      },
    });

    return NextResponse.json({
      unreadCount: result._sum.unreadByBuyer || 0,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}
