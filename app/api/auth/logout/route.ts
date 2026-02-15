import { NextResponse } from "next/server";
import { clearBuyerSession } from "@/lib/buyer-auth";

export async function POST() {
  try {
    await clearBuyerSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to log out" },
      { status: 500 }
    );
  }
}
