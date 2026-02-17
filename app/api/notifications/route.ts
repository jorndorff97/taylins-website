import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-config";
import { hasValidAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const limit = Number(searchParams.get("limit")) || 20;
  const isAdminRequest = searchParams.get("isAdmin") === "true";

  let userId: string | null = null;
  let isAdmin = false;

  if (isAdminRequest) {
    isAdmin = await hasValidAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: isAdmin ? null : userId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId: isAdmin ? null : userId,
      read: false,
    },
  });

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdminRequest = searchParams.get("isAdmin") === "true";

  let userId: string | null = null;
  let isAdmin = false;

  if (isAdminRequest) {
    isAdmin = await hasValidAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await request.json();
  const { notificationIds, markAll } = body;

  if (markAll) {
    // Mark all as read
    await prisma.notification.updateMany({
      where: {
        userId: isAdmin ? null : userId,
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
        userId: isAdmin ? null : userId, // Security: ensure they own these notifications
      },
      data: {
        read: true,
      },
    });
  }

  return NextResponse.json({ success: true });
}
