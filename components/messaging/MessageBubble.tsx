"use client";

import { format } from "date-fns";
import { clsx } from "clsx";

interface MessageBubbleProps {
  body: string;
  createdAt: Date | string;
  isOwnMessage: boolean;
  senderName?: string;
  showName?: boolean;
}

export function MessageBubble({
  body,
  createdAt,
  isOwnMessage,
  senderName,
  showName = false,
}: MessageBubbleProps) {
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  return (
    <div
      className={clsx(
        "flex flex-col space-y-1 w-full",
        isOwnMessage ? "items-end" : "items-start"
      )}
    >
      {showName && senderName && !isOwnMessage && (
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
          {senderName}
        </span>
      )}
      <div
        className={clsx(
          "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all",
          isOwnMessage
            ? "bg-slate-900 text-white rounded-tr-none"
            : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{body}</p>
      </div>
      <span
        className={clsx(
          "text-[10px] text-slate-400 font-medium px-1",
          isOwnMessage ? "text-right" : "text-left"
        )}
      >
        {format(date, "h:mm a")}
      </span>
    </div>
  );
}
