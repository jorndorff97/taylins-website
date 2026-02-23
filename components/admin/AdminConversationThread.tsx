"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  senderType: string;
  messageType: string;
  body: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AdminConversationThreadProps {
  conversation: {
    id: number;
    listingId: number;
    listingTitle: string;
    listingImage: string | null;
    listingPrice: number | null;
    buyerEmail: string;
    buyerName: string | null;
    messages: Message[];
  };
}

interface OfferDetails {
  messageId: number;
  quantity: number;
  pricePerPair: number | null;
  sizes: Array<{ sizeLabel: string; quantity: number }> | null;
  body: string;
  createdAt: string;
}

export function AdminConversationThread({ conversation }: AdminConversationThreadProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [detailsPanel, setDetailsPanel] = useState<{
    open: boolean;
    offer: OfferDetails | null;
    mode: "view" | "adjust";
    adjustedQty: string;
    adjustedPrice: string;
    note: string;
  }>({
    open: false,
    offer: null,
    mode: "view",
    adjustedQty: "",
    adjustedPrice: "",
    note: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendTextReply = async (body: string) => {
    const res = await fetch(`/api/admin/conversations/${conversation.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: body }),
    });
    if (!res.ok) throw new Error("Failed to send");
    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      {
        id: data.messageId,
        senderType: "SELLER",
        messageType: "TEXT",
        body,
        metadata: null,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const sendPaymentLink = async (
    quantity: number,
    pricePerPair: number,
    note: string,
    sizes?: Array<{ sizeLabel: string; quantity: number }> | null,
  ) => {
    const res = await fetch(`/api/admin/conversations/${conversation.id}/payment-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity,
        pricePerPair,
        message: note || undefined,
        sizes: sizes ?? undefined,
      }),
    });
    if (!res.ok) throw new Error("Failed to create payment link");
    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        id: data.messageId,
        senderType: "SELLER",
        messageType: "PAYMENT_LINK",
        body: note
          ? `${note}\n\nPayment link: ${data.paymentUrl}`
          : `Payment link for ${quantity} pairs @ $${pricePerPair}/pair: ${data.paymentUrl}`,
        metadata: { quantity, pricePerPair, totalAmount: quantity * pricePerPair, paymentUrl: data.paymentUrl },
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await sendTextReply(newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const openOfferDetails = (msg: Message) => {
    const qty = typeof msg.metadata?.quantity === "number" ? msg.metadata.quantity : 0;
    const price = typeof msg.metadata?.pricePerPair === "number" ? msg.metadata.pricePerPair : null;
    const sizes = Array.isArray(msg.metadata?.sizes) ? msg.metadata.sizes as Array<{ sizeLabel: string; quantity: number }> : null;

    setDetailsPanel({
      open: true,
      offer: {
        messageId: msg.id,
        quantity: qty,
        pricePerPair: price,
        sizes,
        body: msg.body,
        createdAt: msg.createdAt,
      },
      mode: "view",
      adjustedQty: String(qty),
      adjustedPrice: price ? String(price) : "",
      note: "",
    });
  };

  const handleAcceptOffer = async () => {
    if (!detailsPanel.offer || sending) return;
    const { quantity, pricePerPair, sizes } = detailsPanel.offer;
    if (!pricePerPair) {
      setDetailsPanel((p) => ({ ...p, mode: "adjust" }));
      return;
    }
    setSending(true);
    try {
      await sendPaymentLink(quantity, pricePerPair, "", sizes);
      setDetailsPanel((p) => ({ ...p, open: false }));
    } catch (error) {
      console.error("Failed to accept offer:", error);
    } finally {
      setSending(false);
    }
  };

  const handleSendAdjusted = async () => {
    if (sending) return;
    const qty = Number(detailsPanel.adjustedQty);
    const price = Number(detailsPanel.adjustedPrice);
    if (!qty || !price) return;

    setSending(true);
    try {
      await sendPaymentLink(qty, price, detailsPanel.note, detailsPanel.offer?.sizes);
      setDetailsPanel((p) => ({ ...p, open: false }));
    } catch (error) {
      console.error("Failed to send adjusted payment link:", error);
    } finally {
      setSending(false);
    }
  };

  const isLatestOffer = (msg: Message, idx: number): boolean => {
    if (msg.messageType !== "OFFER" && msg.messageType !== "COUNTER_OFFER") return false;
    for (let i = idx + 1; i < messages.length; i++) {
      const t = messages[i].messageType;
      if (t === "OFFER" || t === "COUNTER_OFFER" || t === "PAYMENT_LINK" || t === "SYSTEM") {
        return false;
      }
    }
    return true;
  };

  const buyerName = conversation.buyerName || conversation.buyerEmail.split("@")[0];

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] relative">
      {/* Listing Info */}
      <div className="flex items-center gap-4 rounded-xl bg-white border border-slate-200 p-4 mb-4">
        {conversation.listingImage && (
          <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 p-0.5">
            <img src={conversation.listingImage} alt={conversation.listingTitle} className="h-full w-full object-contain" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{conversation.listingTitle}</p>
          <p className="text-xs text-slate-500 truncate">
            Conversation with <span className="font-medium text-slate-700">{buyerName}</span>
          </p>
        </div>
        <Link
          href={`/admin/listings/${conversation.listingId}/edit`}
          className="flex-shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          View listing
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.map((msg, idx) => {
          const isAdmin = msg.senderType === "SELLER";
          const isOffer = msg.messageType === "OFFER" || msg.messageType === "COUNTER_OFFER";
          const isPaymentLink = msg.messageType === "PAYMENT_LINK";
          const isSystem = msg.messageType === "SYSTEM";
          const showViewDetails = !isAdmin && isOffer && isLatestOffer(msg, idx);

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center py-2">
                <div className="rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-center">
                  <p className="text-xs font-medium text-emerald-700">{msg.body}</p>
                </div>
              </div>
            );
          }

          if (isPaymentLink) {
            const paymentUrl = typeof msg.metadata?.paymentUrl === "string" ? msg.metadata.paymentUrl : null;
            return (
              <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] min-w-0 rounded-2xl overflow-hidden border border-emerald-200 bg-emerald-50">
                  <div className="px-4 py-2.5 bg-emerald-100/60 border-b border-emerald-200 flex items-center gap-2">
                    <svg className="h-4 w-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Payment Link Sent</span>
                  </div>
                  <div className="px-4 py-3">
                    {msg.metadata && (
                      <div className="flex flex-wrap gap-4 mb-2">
                        {typeof msg.metadata.quantity === "number" && (
                          <div><p className="text-[10px] text-emerald-600 uppercase">Qty</p><p className="text-sm font-bold text-emerald-900">{msg.metadata.quantity}</p></div>
                        )}
                        {typeof msg.metadata.pricePerPair === "number" && (
                          <div><p className="text-[10px] text-emerald-600 uppercase">Price</p><p className="text-sm font-bold text-emerald-900">${msg.metadata.pricePerPair}/pair</p></div>
                        )}
                        {typeof msg.metadata.totalAmount === "number" && (
                          <div><p className="text-[10px] text-emerald-600 uppercase">Total</p><p className="text-sm font-bold text-emerald-900">${msg.metadata.totalAmount}</p></div>
                        )}
                      </div>
                    )}
                    {paymentUrl && paymentUrl.startsWith("http") && (
                      <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline break-all">
                        Open checkout link <span className="flex-shrink-0">→</span>
                      </a>
                    )}
                    <p className="text-[10px] text-emerald-500 mt-2">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          if (isOffer) {
            return (
              <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] min-w-0 rounded-2xl overflow-hidden border ${isAdmin ? "border-slate-700 bg-slate-900 text-white" : "border-blue-200 bg-blue-50 text-slate-900"}`}>
                  <div className={`px-4 py-2.5 ${isAdmin ? "bg-slate-800 border-b border-slate-700" : "bg-blue-100/60 border-b border-blue-200"}`}>
                    <div className="flex items-center gap-2">
                      <svg className={`h-3.5 w-3.5 flex-shrink-0 ${isAdmin ? "text-slate-400" : "text-blue-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className={`text-xs font-semibold uppercase tracking-wide break-words ${isAdmin ? "text-slate-300" : "text-blue-600"}`}>
                        {msg.messageType === "COUNTER_OFFER" ? "Counter Offer" : "Offer"} from {isAdmin ? "You" : buyerName}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {msg.metadata && (
                      <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                        {conversation.listingPrice !== null && (
                          <div><p className={`text-[10px] uppercase tracking-wide ${isAdmin ? "text-slate-400" : "text-blue-400"}`}>List Price</p><p className="text-sm font-bold text-blue-600">${conversation.listingPrice}</p></div>
                        )}
                        {typeof msg.metadata.quantity === "number" && (
                          <div><p className={`text-[10px] uppercase tracking-wide ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Quantity</p><p className="text-sm font-bold">{msg.metadata.quantity} pairs</p></div>
                        )}
                        {typeof msg.metadata.pricePerPair === "number" && (
                          <div><p className={`text-[10px] uppercase tracking-wide ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Price</p><p className="text-sm font-bold">${msg.metadata.pricePerPair}/pair</p></div>
                        )}
                        {typeof msg.metadata.quantity === "number" && typeof msg.metadata.pricePerPair === "number" && (
                          <div><p className={`text-[10px] uppercase tracking-wide ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Total</p><p className="text-sm font-bold">${(msg.metadata.quantity as number) * (msg.metadata.pricePerPair as number)}</p></div>
                        )}
                      </div>
                    )}
                    {msg.metadata && Array.isArray(msg.metadata.sizes) && msg.metadata.sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(msg.metadata.sizes as Array<{ sizeLabel: string; quantity: number }>).map((s) => (
                          <span key={s.sizeLabel} className={`rounded-md px-2 py-0.5 text-xs font-medium ${isAdmin ? "bg-slate-700 text-slate-200" : "bg-blue-100 text-blue-700"}`}>
                            {s.sizeLabel} × {s.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                    {msg.body && <p className={`text-sm pt-1 break-words ${isAdmin ? "text-slate-300" : "text-slate-600"}`}>&ldquo;{msg.body}&rdquo;</p>}
                    <p className={`text-[10px] ${isAdmin ? "text-slate-500" : "text-slate-400"}`}>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</p>
                  </div>
                  {showViewDetails && (
                    <div className="border-t border-blue-200">
                      <button onClick={() => openOfferDetails(msg)} className="w-full py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-100/60 transition-colors">
                        View Details & Respond
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] min-w-0 rounded-2xl px-4 py-3 ${isAdmin ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"}`}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                <p className={`text-[10px] mt-1.5 ${isAdmin ? "text-slate-400" : "text-slate-400"}`}>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Form */}
      <form onSubmit={handleSend} className="pt-4 border-t border-slate-200 mt-2">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a reply..."
            className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <button type="submit" disabled={!newMessage.trim() || sending} className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {sending ? "..." : "Send"}
          </button>
        </div>
      </form>

      {/* Details Panel (slide-over) */}
      {detailsPanel.open && detailsPanel.offer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailsPanel((p) => ({ ...p, open: false }))} />
          <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Offer Details</h2>
              <button onClick={() => setDetailsPanel((p) => ({ ...p, open: false }))} className="p-1 rounded hover:bg-slate-100">
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Listing Context */}
              {conversation.listingPrice !== null && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Original Listing Price</p>
                  <p className="text-xl font-black text-blue-900">${conversation.listingPrice}<span className="text-sm font-normal text-blue-600"> / pair</span></p>
                </div>
              )}

              {/* Original Offer Summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Buyer's Offer</p>
                <div className="flex gap-6">
                  <div><p className="text-[10px] text-slate-500 uppercase">Quantity</p><p className="text-lg font-bold text-slate-900">{detailsPanel.offer.quantity} pairs</p></div>
                  {detailsPanel.offer.pricePerPair !== null && (
                    <div><p className="text-[10px] text-slate-500 uppercase">Price</p><p className="text-lg font-bold text-slate-900">${detailsPanel.offer.pricePerPair}/pair</p></div>
                  )}
                  {detailsPanel.offer.pricePerPair !== null && (
                    <div><p className="text-[10px] text-slate-500 uppercase">Total</p><p className="text-lg font-bold text-emerald-600">${detailsPanel.offer.quantity * detailsPanel.offer.pricePerPair}</p></div>
                  )}
                </div>
                {detailsPanel.offer.sizes && detailsPanel.offer.sizes.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase mb-1.5">Sizes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {detailsPanel.offer.sizes.map((s) => (
                        <span key={s.sizeLabel} className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">{s.sizeLabel} × {s.quantity}</span>
                      ))}
                    </div>
                  </div>
                )}
                {detailsPanel.offer.body && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Message</p>
                    <p className="text-sm text-slate-700 bg-white rounded-lg border border-slate-200 px-3 py-2">{detailsPanel.offer.body}</p>
                  </div>
                )}
              </div>

              {detailsPanel.mode === "view" ? (
                <div className="space-y-3">
                  {detailsPanel.offer.pricePerPair !== null && (
                    <Button onClick={handleAcceptOffer} disabled={sending} className="w-full" size="lg">
                      {sending ? "Creating payment link..." : "Accept & Send Payment Link"}
                    </Button>
                  )}
                  <Button onClick={() => setDetailsPanel((p) => ({ ...p, mode: "adjust" }))} variant="ghost" className="w-full border border-slate-200" size="lg">
                    Adjust Terms
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Adjust & Send Payment Link</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={detailsPanel.adjustedQty}
                        onChange={(e) => setDetailsPanel((p) => ({ ...p, adjustedQty: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase mb-1">Price / pair</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detailsPanel.adjustedPrice}
                          onChange={(e) => setDetailsPanel((p) => ({ ...p, adjustedPrice: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        />
                        {conversation.listingPrice !== null && (
                          <p className="mt-1 text-[10px] text-slate-400 italic">
                            Listing price: ${conversation.listingPrice}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {Number(detailsPanel.adjustedQty) > 0 && Number(detailsPanel.adjustedPrice) > 0 && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
                      <p className="text-xs text-emerald-600">Total: <span className="text-lg font-bold text-emerald-700">${(Number(detailsPanel.adjustedQty) * Number(detailsPanel.adjustedPrice)).toFixed(2)}</span></p>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">Note (optional)</label>
                    <input
                      type="text"
                      value={detailsPanel.note}
                      onChange={(e) => setDetailsPanel((p) => ({ ...p, note: e.target.value }))}
                      placeholder="e.g., Best price I can do for this order..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => setDetailsPanel((p) => ({ ...p, mode: "view" }))} variant="ghost" className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleSendAdjusted} disabled={sending || !detailsPanel.adjustedQty || !detailsPanel.adjustedPrice} className="flex-1">
                      {sending ? "Sending..." : "Send Payment Link"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
