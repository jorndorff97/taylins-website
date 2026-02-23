import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SECRET environment variable is required. Generate one with: openssl rand -base64 32"
    );
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(adminUserId: number): string {
  const timestamp = Date.now().toString();
  const payload = `${adminUserId}.${timestamp}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySessionToken(token: string): { valid: boolean; adminUserId: number | null } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return { valid: false, adminUserId: null };

    const [adminId, timestamp, sig] = parts;
    if (!adminId || !timestamp || !sig) return { valid: false, adminUserId: null };

    const payload = `${adminId}.${timestamp}`;
    const expected = sign(payload);
    if (expected.length !== sig.length) return { valid: false, adminUserId: null };
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig)))
      return { valid: false, adminUserId: null };

    const age = Date.now() - Number(timestamp);
    if (age < 0 || age >= MAX_AGE * 1000) return { valid: false, adminUserId: null };

    return { valid: true, adminUserId: Number(adminId) };
  } catch {
    return { valid: false, adminUserId: null };
  }
}

export async function setAdminSession(adminUserId: number): Promise<string> {
  const token = createSessionToken(adminUserId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return token;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function hasValidAdminSession(): Promise<boolean> {
  const result = await getAdminSession();
  return result !== null;
}

export async function getAdminSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const { valid, adminUserId } = verifySessionToken(token);
  return valid ? adminUserId : null;
}
