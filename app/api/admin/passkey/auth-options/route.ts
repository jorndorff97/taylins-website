import { NextResponse } from "next/server";
import { getAuthenticationOptions } from "@/lib/webauthn";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const options = await getAuthenticationOptions();

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
    console.error("Passkey auth-options error:", error);
    return NextResponse.json(
      { error: "Failed to generate authentication options" },
      { status: 500 },
    );
  }
}
