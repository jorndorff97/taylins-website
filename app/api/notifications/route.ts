import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-config";
import { hasValidAdminSession } from "@/lib/auth";

// Cache for 60 seconds to reduce DB load
const CACHE_TTL_MS = 60_000;
// After a failure, don't retry for 30 seconds
const CIRCUIT_BREAKER_MS = 30_000;

const cache = new Map<string, { data: unknown; timestamp: number }>();
let lastFailure = 0;

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

function isCircuitOpen() {
  return Date.now() - lastFailure < CIRCUIT_BREAKER_MS;
}

const EMPTY_RESULT = { notifications: [], unreadCount: 0 };

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

  const cacheKey = `notifications:${isAdmin ? "admin" : userId}:${unreadOnly}:${limit}`;
  
  // Return cached data if available
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // If circuit breaker is open (recent failure), return empty without hitting DB
  if (isCircuitOpen()) {
    return NextResponse.json(EMPTY_RESULT);
  }

  try {
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

    const result = { notifications, unreadCount };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch {
    // Record failure and cache empty result
    lastFailure = Date.now();
    setCache(cacheKey, EMPTY_RESULT);
    return NextResponse.json(EMPTY_RESULT);
  }
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

  try {
    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
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
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: isAdmin ? null : userId,
        },
        data: {
          read: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
