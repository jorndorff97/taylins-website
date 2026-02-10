import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setBuyerSession } from "@/lib/buyer-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/register?error=missing", request.url),
    );
  }

  if (password.length < 8) {
    return NextResponse.redirect(
      new URL("/register?error=short", request.url),
    );
  }

  const existing = await prisma.buyer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.redirect(
      new URL("/register?error=exists", request.url),
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const buyer = await prisma.buyer.create({
    data: { email, passwordHash, name: name || null },
  });

  await setBuyerSession(buyer.id);
  return NextResponse.redirect(new URL("/", request.url));
}
