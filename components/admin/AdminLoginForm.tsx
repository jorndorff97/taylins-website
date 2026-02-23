"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminLoginFormProps {
  error?: string;
}

export function AdminLoginForm({ error }: AdminLoginFormProps) {
  const router = useRouter();
  const [hasPasskeys, setHasPasskeys] = useState(false);
  const [supportsWebAuthn, setSupportsWebAuthn] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    setSupportsWebAuthn(browserSupportsWebAuthn());

    // Fetch CSRF token
    fetch("/api/csrf-token")
      .then((r) => r.json())
      .then((data) => setCsrfToken(data.token))
      .catch(() => {});

    fetch("/api/admin/passkey/status")
      .then((r) => r.json())
      .then((data) => setHasPasskeys(data.hasPasskeys))
      .catch(() => {});
  }, []);

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);

    try {
      const optionsRes = await fetch("/api/admin/passkey/auth-options", {
        method: "POST",
      });
      if (!optionsRes.ok) throw new Error("Failed to get authentication options");
      const options = await optionsRes.json();

      const credential = await startAuthentication(options);

      const verifyRes = await fetch("/api/admin/passkey/auth-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credential),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin/listings");
      router.refresh();
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setPasskeyError("Authentication was cancelled.");
      } else {
        setPasskeyError(
          err instanceof Error ? err.message : "Passkey authentication failed",
        );
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  const showPasskeyOption = supportsWebAuthn && hasPasskeys;

  return (
    <Card className="w-full max-w-sm">
      {showPasskeyOption && (
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-slate-900">Admin login</h1>
          <p className="mt-1 text-xs text-slate-500">
            Use your passkey to sign in instantly.
          </p>

          {passkeyError && (
            <p className="mt-2 text-xs text-red-600">{passkeyError}</p>
          )}

          <Button
            type="button"
            className="mt-4 w-full gap-2"
            onClick={handlePasskeyLogin}
            disabled={passkeyLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
              <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2" />
              <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
              <path d="M12 10a2 2 0 0 0-2 2c0 1.02.1 2.51.33 4" />
              <path d="M8.65 22c.21-.66.45-1.32.57-2" />
              <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
              <path d="M2 16h.01" />
              <path d="M21.8 16c.2-2 .131-5.354 0-6" />
              <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
            </svg>
            {passkeyLoading ? "Authenticating…" : "Sign in with Passkey"}
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400">or use email &amp; password</span>
            </div>
          </div>
        </div>
      )}

      <form action="/api/admin/login" method="POST">
        <input type="hidden" name="csrf_token" value={csrfToken} />
        {!showPasskeyOption && (
          <>
            <h1 className="text-lg font-semibold text-slate-900">Admin login</h1>
            <p className="mt-1 text-xs text-slate-500">
              Sign in with your admin account.
            </p>
          </>
        )}

        {error === "invalid" && (
          <p className="mt-2 text-xs text-red-600">
            Invalid email or password.
          </p>
        )}

        <div className={`${showPasskeyOption ? "" : "mt-4"} space-y-3`}>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-slate-700"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-700"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1"
            />
          </div>
          <Button type="submit" variant={showPasskeyOption ? "ghost" : "primary"} className={`w-full ${showPasskeyOption ? "border border-slate-200" : ""}`}>
            Sign in
          </Button>
        </div>
      </form>
    </Card>
  );
}
