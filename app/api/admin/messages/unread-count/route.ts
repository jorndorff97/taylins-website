import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasValidAdminSession } from "@/lib/auth";

export async function GET() {
  const isAdmin = await hasValidAdminSession();
  
  if (!isAdmin) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const result = await prisma.conversation.aggregate({
      _sum: {
        unreadByAdmin: true,
      },
    });

    return NextResponse.json({
      count: result._sum.unreadByAdmin || 0,
    });
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return NextResponse.json({ count: 0 });
  }
}
