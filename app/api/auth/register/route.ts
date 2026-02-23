import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/password-validation";
import { sanitizeField } from "@/lib/sanitize";
import { logSecurityEvent, getClientInfo } from "@/lib/audit-log";

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, "register", RATE_LIMITS.register);
  if (rateLimited) return rateLimited;

  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.errors.join(". ") },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: sanitizeField(name, 100),
        email: normalizedEmail,
        passwordHash,
      },
    });

    const { ip, userAgent } = getClientInfo(request);
    await logSecurityEvent({
      event: "USER_REGISTERED",
      ip,
      userAgent,
      userId: user.id,
      metadata: { email: normalizedEmail },
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
