import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setBuyerSession } from "@/lib/buyer-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "").trim();

  if (!email || !password) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "missing");
    if (redirectTo) url.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(url);
  }

  const buyer = await prisma.buyer.findUnique({ where: { email } });
  if (!buyer) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "invalid");
    if (redirectTo) url.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(url);
  }

  const ok = await bcrypt.compare(password, buyer.passwordHash);
  if (!ok) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "invalid");
    if (redirectTo) url.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(url);
  }

  await setBuyerSession(buyer.id);
  const dest = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/";
  return NextResponse.redirect(new URL(dest, request.url));
}
