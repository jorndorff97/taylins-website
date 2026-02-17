import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-config";

export async function GET() {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const result = await prisma.conversation.aggregate({
      where: {
        userId,
        status: "ACTIVE",
      },
      _sum: {
        unreadByUser: true,
      },
    });

    return NextResponse.json({
      unreadCount: result._sum.unreadByUser || 0,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}
