"use client";

import { useState, useRef, useEffect } from "react";
import { SenderType } from "@prisma/client";
import { MessageBubble } from "@/components/messaging/MessageBubble";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);

    try {
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
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-10 bg-slate-50/50 rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col h-[600px] shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Chat
        </h2>
        <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
          Order #{orderId}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                body={m.body}
                createdAt={m.createdAt}
                isOwnMessage={m.senderType === SenderType.BUYER}
                senderName={m.senderType === SenderType.BUYER ? "You" : "Seller"}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 p-2 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-all">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none min-h-[40px] max-h-32 scrollbar-hide"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all active:scale-95"
          >
            {submitting ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <p className="mt-2 text-[10px] text-slate-400 text-center font-medium">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
