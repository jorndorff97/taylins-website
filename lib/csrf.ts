import { createHmac, randomBytes } from "crypto";
import { cookies } from "next/headers";

const CSRF_COOKIE = "csrf_token";
const CSRF_SECRET = process.env.ADMIN_SECRET || "csrf-fallback";
const TOKEN_MAX_AGE = 60 * 60; // 1 hour

function signToken(token: string): string {
  return createHmac("sha256", CSRF_SECRET).update(token).digest("hex");
}

export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const timestamp = Date.now().toString();
  const payload = `${token}.${timestamp}`;
  const signature = signToken(payload);
  const fullToken = `${payload}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, fullToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });

  return fullToken;
}

export async function validateCsrfToken(formToken: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
    if (!cookieToken || !formToken) return false;

    if (cookieToken !== formToken) return false;

    const parts = cookieToken.split(".");
    if (parts.length !== 3) return false;

    const [token, timestamp, signature] = parts;
    if (!token || !timestamp || !signature) return false;

    const payload = `${token}.${timestamp}`;
    const expected = signToken(payload);
    if (expected !== signature) return false;

    const age = Date.now() - Number(timestamp);
    if (age < 0 || age >= TOKEN_MAX_AGE * 1000) return false;

    cookieStore.delete(CSRF_COOKIE);

    return true;
  } catch {
    return false;
  }
}
