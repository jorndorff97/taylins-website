"use client";

import { useState, useEffect, useCallback } from "react";
import { startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Passkey {
  id: string;
  deviceName: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

export function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [supported, setSupported] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPasskeys = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/passkey");
      if (res.ok) {
        const data = await res.json();
        setPasskeys(data.passkeys);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSupported(browserSupportsWebAuthn());
    fetchPasskeys();
  }, [fetchPasskeys]);

  const handleRegister = async () => {
    setRegistering(true);
    setMessage(null);

    try {
      const optionsRes = await fetch("/api/admin/passkey/register-options", {
        method: "POST",
      });
      if (!optionsRes.ok) throw new Error("Failed to get registration options");
      const options = await optionsRes.json();

      const credential = await startRegistration(options);

      const deviceName = detectDeviceName();

      const verifyRes = await fetch("/api/admin/passkey/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, deviceName }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error || "Registration failed");
      }

      setMessage({ type: "success", text: "Passkey registered successfully!" });
      fetchPasskeys();
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setMessage({ type: "error", text: "Registration was cancelled." });
      } else {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to register passkey",
        });
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this passkey? You won't be able to use it to sign in anymore.")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/passkey", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setPasskeys((prev) => prev.filter((pk) => pk.id !== id));
        setMessage({ type: "success", text: "Passkey removed." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove passkey." });
    }
  };

  if (!supported) {
    return (
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-900">Passkeys</h2>
        <p className="mt-2 text-xs text-slate-500">
          Your browser doesn&apos;t support passkeys. Try using Safari, Chrome,
          or Edge on a device with biometric authentication.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Passkeys</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in with Face ID, Touch ID, or Windows Hello instead of a password.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleRegister}
          disabled={registering}
          className="shrink-0"
        >
          {registering ? "Registering…" : "Add passkey"}
        </Button>
      </div>

      {message && (
        <p
          className={`mt-3 text-xs ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-xs text-slate-400">Loading…</p>
      ) : passkeys.length === 0 ? (
        <p className="mt-4 text-xs text-slate-400">
          No passkeys registered yet. Add one to enable biometric sign-in.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {passkeys.map((pk) => (
            <li key={pk.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {pk.deviceName || "Passkey"}
                </p>
                <p className="text-xs text-slate-400">
                  Added {new Date(pk.createdAt).toLocaleDateString()}
                  {pk.lastUsedAt && (
                    <> &middot; Last used {new Date(pk.lastUsedAt).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleDelete(pk.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function detectDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";
  return "Unknown Device";
}
