import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { verifyAndSaveRegistration } from "@/lib/webauthn";
import { cookies } from "next/headers";
import { logSecurityEvent, getClientInfo } from "@/lib/audit-log";

export async function POST(request: Request) {
  const adminUserId = await getAdminSession();
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    await verifyAndSaveRegistration(
      adminUserId,
      body.credential,
      challenge,
      body.deviceName,
    );

    await logSecurityEvent({
      event: "PASSKEY_REGISTERED",
      ip,
      userAgent,
      adminUserId,
      metadata: { deviceName: body.deviceName || null },
    });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Passkey register-verify error:", error);
    return NextResponse.json(
      { error: "Registration verification failed" },
      { status: 400 },
    );
  }
}
