import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "X-DNS-Prefetch-Control": "on",
} as const;

function getCSP() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.stripe.com",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://*.vercel-storage.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

function getSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET environment variable is required");
  }
  return secret;
}

async function verifySessionTokenEdge(token: string): Promise<boolean> {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return false;

    const [adminId, timestamp, sig] = parts;
    if (!adminId || !timestamp || !sig) return false;

    const payload = `${adminId}.${timestamp}`;
    const secret = getSecret();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );
    const expected = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expected.length !== sig.length || expected !== sig) return false;

    const age = Date.now() - Number(timestamp);
    if (age < 0 || age >= MAX_AGE * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  response.headers.set("Content-Security-Policy", getCSP());
  return response;
}

const ADMIN_PUBLIC_PATHS = ["/admin/login"];
const ADMIN_API_PUBLIC_PATHS = [
  "/api/admin/login",
  "/api/admin/passkey/status",
  "/api/admin/passkey/auth-options",
  "/api/admin/passkey/auth-verify",
  "/api/csrf-token",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin page protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    if (!ADMIN_PUBLIC_PATHS.some((p) => pathname === p)) {
      const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (!sessionToken || !(await verifySessionTokenEdge(sessionToken))) {
        const loginUrl = new URL("/admin/login", request.url);
        const response = NextResponse.redirect(loginUrl);
        return applySecurityHeaders(response);
      }
    }
  }

  // Admin API protection
  if (pathname.startsWith("/api/admin")) {
    if (!ADMIN_API_PUBLIC_PATHS.some((p) => pathname === p)) {
      const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (!sessionToken || !(await verifySessionTokenEdge(sessionToken))) {
        const response = NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
        return applySecurityHeaders(response);
      }
    }
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
