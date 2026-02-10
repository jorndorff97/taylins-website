import { NextResponse } from "next/server";
import { clearBuyerSession } from "@/lib/buyer-auth";

export async function POST(request: Request) {
  await clearBuyerSession();
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/", url.origin));
}
