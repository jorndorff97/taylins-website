import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getRegistrationOptions } from "@/lib/webauthn";
import { cookies } from "next/headers";

export async function POST() {
  const adminUserId = await getAdminSession();
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const options = await getRegistrationOptions(adminUserId);

    const cookieStore = await cookies();
    cookieStore.set("webauthn_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 300,
      path: "/",
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Passkey register-options error:", error);
    return NextResponse.json(
      { error: "Failed to generate registration options" },
      { status: 500 },
    );
  }
}
