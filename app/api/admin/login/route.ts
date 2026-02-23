import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrfToken } from "@/lib/csrf";
import {
  isAccountLocked,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/lib/account-lockout";
import { logSecurityEvent, getClientInfo } from "@/lib/audit-log";

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, "admin-login", RATE_LIMITS.adminLogin);
  if (rateLimited) return rateLimited;

  const { ip, userAgent } = getClientInfo(request);
  const formData = await request.formData();

  const csrfToken = String(formData.get("csrf_token") ?? "");
  const csrfValid = await validateCsrfToken(csrfToken);
  if (!csrfValid) {
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
    );
  }

  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
    );
  }

  if (isAccountLocked(email)) {
    await logSecurityEvent({
      event: "ACCOUNT_LOCKED",
      ip,
      userAgent,
      metadata: { email },
    });
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
    );
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin) {
    recordFailedAttempt(email);
    await logSecurityEvent({
      event: "ADMIN_LOGIN_FAILURE",
      ip,
      userAgent,
      metadata: { email, reason: "user_not_found" },
    });
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
    );
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    recordFailedAttempt(email);
    await logSecurityEvent({
      event: "ADMIN_LOGIN_FAILURE",
      ip,
      userAgent,
      adminUserId: admin.id,
      metadata: { email, reason: "wrong_password" },
    });
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
    );
  }

  clearFailedAttempts(email);
  await setAdminSession(admin.id);

  await logSecurityEvent({
    event: "ADMIN_LOGIN_SUCCESS",
    ip,
    userAgent,
    adminUserId: admin.id,
  });

  return NextResponse.redirect(new URL("/admin/listings", request.url));
}
