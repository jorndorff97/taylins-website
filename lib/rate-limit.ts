import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxAttempts: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export const RATE_LIMITS = {
  adminLogin: { maxAttempts: 5, windowSeconds: 900 } as RateLimitConfig,
  userLogin: { maxAttempts: 5, windowSeconds: 900 } as RateLimitConfig,
  register: { maxAttempts: 3, windowSeconds: 3600 } as RateLimitConfig,
  upload: { maxAttempts: 10, windowSeconds: 3600 } as RateLimitConfig,
  general: { maxAttempts: 60, windowSeconds: 60 } as RateLimitConfig,
} as const;

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxAttempts - 1, resetAt };
  }

  entry.count++;
  if (entry.count > config.maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Applies rate limiting to an API route handler by IP.
 * Returns a 429 response if limit exceeded, or null if allowed.
 */
export function applyRateLimit(
  request: NextRequest,
  namespace: string,
  config: RateLimitConfig
): NextResponse | null {
  const ip = getClientIP(request);
  const key = `${namespace}:${ip}`;
  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(config.maxAttempts),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}
