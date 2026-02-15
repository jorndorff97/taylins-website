import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";

export async function GET(request: NextRequest) {
  const buyerId = await getBuyerId();
  
  if (!buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const limit = Number(searchParams.get("limit")) || 20;

  const notifications = await prisma.notification.findMany({
    where: {
      buyerId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      buyerId,
      read: false,
    },
  });

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}

export async function PATCH(request: NextRequest) {
  const buyerId = await getBuyerId();
  
  if (!buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { notificationIds, markAll } = body;

  if (markAll) {
    // Mark all as read
    await prisma.notification.updateMany({
      where: {
        buyerId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  } else if (notificationIds && Array.isArray(notificationIds)) {
    // Mark specific notifications as read
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        buyerId, // Security: ensure they own these notifications
      },
      data: {
        read: true,
      },
    });
  }

  return NextResponse.json({ success: true });
}
