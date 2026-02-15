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
  console.log('[BUYER AUTH] Setting session for buyerId:', buyerId);
  const token = createBuyerSessionToken(buyerId);
  console.log('[BUYER AUTH] Generated token (first 20 chars):', token.substring(0, 20));
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  console.log('[BUYER AUTH] Cookie set successfully');
}

export async function clearBuyerSession(): Promise<void> {
  console.log('[BUYER AUTH] Clearing session');
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  console.log('[BUYER AUTH] Session cleared');
}

export async function getBuyerId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  console.log('[BUYER AUTH] getBuyerId - Cookie exists:', !!token);
  if (!token) return null;
  const parsed = verifyBuyerSessionToken(token);
  console.log('[BUYER AUTH] getBuyerId - Token valid:', !!parsed, parsed ? `BuyerId: ${parsed.buyerId}` : 'Invalid');
  return parsed?.buyerId ?? null;
}
