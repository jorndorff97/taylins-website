import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "buyer_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret = process.env.BUYER_SECRET || process.env.DATABASE_URL || "fallback-buyer-secret";
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createBuyerSessionToken(buyerId: number): string {
  const payload = `${Date.now()}.${buyerId}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyBuyerSessionToken(token: string): { buyerId: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return null;
    const [timestamp, buyerIdStr, sig] = parts;
    const payload = `${timestamp}.${buyerIdStr}`;
    const expected = sign(payload);
    if (expected.length !== sig.length) return null;
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
    const age = Date.now() - Number(timestamp);
    if (age < 0 || age >= MAX_AGE * 1000) return null;
    const buyerId = Number(buyerIdStr);
    if (!Number.isInteger(buyerId) || buyerId <= 0) return null;
    return { buyerId };
  } catch {
    return null;
  }
}

export async function setBuyerSession(buyerId: number): Promise<void> {
  const token = createBuyerSessionToken(buyerId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearBuyerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getBuyerId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parsed = verifyBuyerSessionToken(token);
  return parsed?.buyerId ?? null;
}
