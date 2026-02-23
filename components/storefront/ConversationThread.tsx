"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: number;
  senderType: string;
  messageType: string;
  body: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

interface PaymentInfo {
  url: string | null;
  total: string | null;
  breakdown: string | null;
  details: boolean;
  note: string | null;
}

function parsePaymentLink(body: string): PaymentInfo {
  const urlMatch = body.match(/(https:\/\/checkout\.stripe\.com\/[^\s]+)/);
  const url = urlMatch ? urlMatch[1] : null;
  
  const totalMatch = body.match(/Total:\s*\$?([\d,]+(?:\.\d{2})?)/i);
  const total = totalMatch ? `$${totalMatch[1]}` : null;
  
  const breakdownMatch = body.match(/(\d+)\s*pairs?\s*@\s*\$?([\d.]+)\/pair/i);
  const breakdown = breakdownMatch 
    ? `${breakdownMatch[1]} pairs @ $${breakdownMatch[2]}/pair`
    : null;
  
  const lines = body.split('\n').filter(l => l.trim());
  const noteLines = lines.filter(line => 
    !line.includes('https://') && 
    !line.match(/payment link/i) &&
    !line.match(/Total:/i) &&
    !line.match(/\d+\s*pairs?\s*@/i)
  );
  const note = noteLines.length > 0 ? noteLines.join(' ').trim() : null;
  
  return {
    url,
    total,
    breakdown,
    details: !!(total || breakdown),
    note: note && note.length > 3 ? note : null,
  };
}

interface ConversationThreadProps {
  conversation: {
    id: number;
    listingId: number;
    listingTitle: string;
    listingImage: string | null;
    messages: Message[];
  };
  isPaid?: boolean;
}

export function ConversationThread({ conversation, isPaid = false }: ConversationThreadProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: data.messageId,
            senderType: "BUYER",
            messageType: "TEXT",
            body: newMessage.trim(),
            metadata: null,
            createdAt: new Date().toISOString(),
          },
        ]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 py-4 border-b border-slate-200">
        <Link
          href="/messages"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        {conversation.listingImage && (
          <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0 p-1">
            <img
              src={conversation.listingImage}
              alt={conversation.listingTitle}
              className="h-full w-full object-contain"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-slate-900 truncate">{conversation.listingTitle}</h1>
          <Link
            href={`/listing/${conversation.listingId}`}
            className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            View listing →
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.map((msg) => {
          const isYou = msg.senderType === "BUYER";
          const isOffer = msg.messageType === "OFFER";
          const isPaymentLink = msg.messageType === "PAYMENT_LINK";

          if (isPaymentLink) {
            const paymentInfo = parsePaymentLink(msg.body);
            
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[85%] w-full sm:max-w-sm">
                  <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                        <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                        {isPaid ? "Order Paid" : "Offer Accepted"}
                      </span>
                    </div>
                    
                    {paymentInfo.details && (
                      <div className="mb-4 rounded-xl bg-white border border-emerald-100 p-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-slate-500">Order Total</span>
                          {paymentInfo.total && (
                            <span className="text-xl font-bold text-slate-900">{paymentInfo.total}</span>
                          )}
                        </div>
                        {paymentInfo.breakdown && (
                          <p className="text-xs text-slate-500 mt-1">{paymentInfo.breakdown}</p>
                        )}
                      </div>
                    )}
                    
                    {paymentInfo.note && (
                      <p className="text-sm text-slate-600 mb-4">{paymentInfo.note}</p>
                    )}
                    
                    {paymentInfo.url && (
                      isPaid ? (
                        <div className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-100 px-5 py-3.5 text-sm font-semibold text-emerald-700">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Payment Complete
                        </div>
                      ) : (
                        <a
                          href={paymentInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Complete Payment
                        </a>
                      )
                    )}
                    
                    <p className="text-[10px] text-slate-400 mt-3 text-center">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isYou ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isYou
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                {isOffer && msg.metadata && (
                  <div className={`mb-2 pb-2 border-b ${isYou ? "border-slate-700" : "border-slate-200"}`}>
                    <p className={`text-xs font-medium ${isYou ? "text-slate-300" : "text-slate-500"}`}>
                      Offer Details
                    </p>
                    {msg.metadata.quantity && (
                      <p className="text-sm">
                        Quantity: <span className="font-semibold">{msg.metadata.quantity} pairs</span>
                      </p>
                    )}
                    {msg.metadata.pricePerPair && (
                      <p className="text-sm">
                        Target: <span className="font-semibold">${msg.metadata.pricePerPair}/pair</span>
                      </p>
                    )}
                    {msg.metadata.sizes && msg.metadata.sizes.length > 0 && (
                      <p className="text-sm">
                        Sizes: {msg.metadata.sizes.map((s: any) => `${s.sizeLabel} (${s.quantity})`).join(", ")}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p className={`text-[10px] mt-1 ${isYou ? "text-slate-400" : "text-slate-400"}`}>
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Form */}
      <form onSubmit={handleSend} className="py-4 border-t border-slate-200 bg-white">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
