import { prisma } from "@/lib/prisma";
import type { SecurityEvent, Prisma } from "@prisma/client";

interface AuditLogParams {
  event: SecurityEvent;
  ip?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  adminUserId?: number | null;
  metadata?: Prisma.InputJsonValue;
}

export async function logSecurityEvent(params: AuditLogParams): Promise<void> {
  try {
    await prisma.securityLog.create({
      data: {
        event: params.event,
        ip: params.ip || null,
        userAgent: params.userAgent?.slice(0, 500) || null,
        userId: params.userId || null,
        adminUserId: params.adminUserId || null,
        metadata: params.metadata || undefined,
      },
    });
  } catch (error) {
    console.error("Failed to write security log:", error);
  }
}

export function getClientInfo(request: Request): {
  ip: string | null;
  userAgent: string | null;
} {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent") || null;
  return { ip, userAgent };
}
