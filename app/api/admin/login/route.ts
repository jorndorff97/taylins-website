import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    console.error("ADMIN_PASSWORD is not set in .env");
    return NextResponse.redirect(
      new URL("/admin/login?error=config", request.url),
    );
  }

  if (password !== expected) {
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
    );
  }

  await setAdminSession();
  return NextResponse.redirect(new URL("/admin/listings", request.url));
}
