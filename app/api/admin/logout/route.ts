import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";

function loginUrl(request: NextRequest) {
  const origin = request.nextUrl.origin;
  return new URL("/admin/login", origin);
}

export async function POST(request: NextRequest) {
  await clearAdminSession();
  return NextResponse.redirect(loginUrl(request));
}

export async function GET(request: NextRequest) {
  await clearAdminSession();
  return NextResponse.redirect(loginUrl(request));
}
