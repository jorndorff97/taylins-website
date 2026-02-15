import { redirect } from "next/navigation";
import { clearBuyerSession } from "@/lib/buyer-auth";

export async function POST() {
  try {
    console.log('[LOGOUT] Starting logout process');
    await clearBuyerSession();
    console.log('[LOGOUT] Session cleared, redirecting to homepage');
    redirect("/");
  } catch (error) {
    console.error("[LOGOUT] Error during logout:", error);
    // Even if there's an error, try to redirect anyway
    redirect("/");
  }
}
