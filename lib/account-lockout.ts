interface LockoutEntry {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const store = new Map<string, LockoutEntry>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (
      entry.lockedUntil &&
      now > entry.lockedUntil + LOCKOUT_DURATION_MS
    ) {
      store.delete(key);
    }
  }
}

export function isAccountLocked(email: string): boolean {
  cleanup();
  const key = email.toLowerCase().trim();
  const entry = store.get(key);
  if (!entry || !entry.lockedUntil) return false;

  if (Date.now() >= entry.lockedUntil) {
    store.delete(key);
    return false;
  }

  return true;
}

export function recordFailedAttempt(email: string): void {
  const key = email.toLowerCase().trim();
  const entry = store.get(key) || {
    failedAttempts: 0,
    lockedUntil: null,
    lastAttempt: 0,
  };

  entry.failedAttempts++;
  entry.lastAttempt = Date.now();

  if (entry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }

  store.set(key, entry);
}

export function clearFailedAttempts(email: string): void {
  store.delete(email.toLowerCase().trim());
}
