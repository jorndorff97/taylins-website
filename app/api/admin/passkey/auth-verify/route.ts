import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/auth";
import { verifyAuthentication } from "@/lib/webauthn";
import { cookies } from "next/headers";
import { logSecurityEvent, getClientInfo } from "@/lib/audit-log";

export async function POST(request: Request) {
  const { ip, userAgent } = getClientInfo(request);

  try {
    const cookieStore = await cookies();
    const challenge = cookieStore.get("webauthn_challenge")?.value;

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge expired. Please try again." },
        { status: 400 },
      );
    }

    cookieStore.delete("webauthn_challenge");

    const body = await request.json();
    const result = await verifyAuthentication(body, challenge);

    if (result.verified) {
      await setAdminSession(result.adminUserId);
      await logSecurityEvent({
        event: "PASSKEY_AUTH_SUCCESS",
        ip,
        userAgent,
        adminUserId: result.adminUserId,
      });
      return NextResponse.json({ verified: true });
    }

    await logSecurityEvent({
      event: "PASSKEY_AUTH_FAILURE",
      ip,
      userAgent,
      metadata: { reason: "verification_failed" },
    });
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Passkey auth-verify error:", error);
    await logSecurityEvent({
      event: "PASSKEY_AUTH_FAILURE",
      ip,
      userAgent,
      metadata: { reason: "exception" },
    });
    return NextResponse.json(
      { error: "Authentication verification failed" },
      { status: 401 },
    );
  }
}
