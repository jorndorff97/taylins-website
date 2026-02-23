"use client";

import { useState } from "react";
import { replyToOrder } from "@/app/admin/(dashboard)/orders/actions";
import { MessageBubble } from "@/components/messaging/MessageBubble";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  senderType: string;
  body: string;
  createdAt: string;
}

interface OrderDetailMessagesProps {
  orderId: number;
  messages: Message[];
}

export function OrderDetailMessages({ orderId, messages }: OrderDetailMessagesProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Buyer Messages ({messages.length})
        </p>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="space-y-4">
          <div className="max-h-[400px] space-y-4 overflow-y-auto rounded-lg bg-slate-50 p-4 scrollbar-hide">
            {messages.length === 0 ? (
              <p className="text-center text-xs text-slate-400">No messages yet</p>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  body={m.body}
                  createdAt={m.createdAt}
                  isOwnMessage={m.senderType === "SELLER"}
                  senderName={m.senderType === "SELLER" ? "You" : "Buyer"}
                />
              ))
            )}
          </div>

          <form action={replyToOrder} className="flex flex-col gap-2">
            <input type="hidden" name="orderId" value={orderId} />
            <textarea
              name="body"
              required
              rows={2}
              placeholder="Reply to buyer..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 resize-none"
            />
            <Button type="submit" variant="secondary" size="sm" className="self-end">
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
