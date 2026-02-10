"use client";

import { useState } from "react";
import { SenderType } from "@prisma/client";

interface Message {
  id: number;
  senderType: string;
  body: string;
  createdAt: Date;
}

interface OrderThreadProps {
  orderId: number;
  messages: Message[];
}

export function OrderThread({ orderId, messages: initialMessages }: OrderThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/order/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, body: body.trim() }),
    });

    const data = await res.json();
    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
      setBody("");
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-10">
      <h2 className="text-lg font-medium text-slate-900">Messages</h2>
      <div className="mt-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg border p-4 ${m.senderType === SenderType.BUYER ? "border-slate-200 bg-slate-50 ml-0" : "border-slate-200 bg-white ml-8"}`}
          >
            <p className="text-xs text-slate-500">
              {m.senderType === SenderType.BUYER ? "You" : "Seller"} ·{" "}
              {new Date(m.createdAt).toLocaleString()}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{m.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your message..."
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="mt-2 rounded-lg bg-hero-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
