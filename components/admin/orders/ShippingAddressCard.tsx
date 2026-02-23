"use client";

import { useState } from "react";

interface ShippingAddressCardProps {
  address: Record<string, any> | null;
}

export function ShippingAddressCard({ address }: ShippingAddressCardProps) {
  const [copied, setCopied] = useState(false);

  if (!address) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Shipping Address
        </p>
        <p className="text-xs text-slate-400 italic">No shipping address provided</p>
      </div>
    );
  }

  const lines = [
    address.name || address.full_name,
    address.line1 || address.address_line_1,
    address.line2 || address.address_line_2,
    [address.city, address.state, address.postal_code || address.zip].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);

  const fullText = lines.join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Shipping Address
        </p>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-slate-700">{line}</p>
        ))}
      </div>
    </div>
  );
}
