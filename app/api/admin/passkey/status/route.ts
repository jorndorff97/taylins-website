import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.adminPasskey.count();
    return NextResponse.json({ hasPasskeys: count > 0 });
  } catch {
    return NextResponse.json({ hasPasskeys: false });
  }
}
