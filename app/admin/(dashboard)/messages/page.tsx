import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type UnifiedMessage = {
  id: number;
  type: 'order' | 'conversation';
  listingTitle: string;
  listingImage: string | null;
  buyerEmail: string;
  buyerName: string | null;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  href: string;
  senderType: string;
};

export default async function AdminMessagesPage() {
  // Fetch orders with messages
  const orders = await prisma.order.findMany({
    where: {
      messages: {
        some: {},
      },
    },
    include: {
      user: true,
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Fetch conversations
  const conversations = await prisma.conversation.findMany({
    include: {
      user: true,
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  // Transform into unified format
  const orderMessages: UnifiedMessage[] = orders.map((order) => {
    const lastMessage = order.messages[0];
    return {
      id: order.id,
      type: 'order',
      listingTitle: order.listing.title,
      listingImage: order.listing.images[0]?.url || null,
      buyerEmail: order.user.email,
      buyerName: order.user.name,
      lastMessage: lastMessage?.body || "Order request",
      lastMessageAt: lastMessage?.createdAt || order.updatedAt,
      unreadCount: 0, // Admin unread tracking for orders not yet implemented
      href: `/admin/orders/${order.id}`,
      senderType: lastMessage?.senderType || "BUYER",
    };
  });

  const conversationMessages: UnifiedMessage[] = conversations.map((conv) => {
    const lastMessage = conv.messages[0];
    return {
      id: conv.id,
      type: 'conversation',
      listingTitle: conv.listing.title,
      listingImage: conv.listing.images[0]?.url || null,
      buyerEmail: conv.user.email,
      buyerName: conv.user.name,
      lastMessage: lastMessage?.body || "New conversation",
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv.unreadByAdmin,
      href: `/admin/conversations/${conv.id}`, // Note: this route might need to be created or redirected
      senderType: lastMessage?.senderType || "BUYER",
    };
  });

  const allMessages = [...orderMessages, ...conversationMessages].sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  );

  return (
    <>
      <AdminHeader title="Messages" />
      <main className="flex-1 bg-background px-6 pb-10 pt-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {allMessages.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">No messages yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Incoming inquiries and offers from buyers will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {allMessages.map((msg) => (
                <Link
                  key={`${msg.type}-${msg.id}`}
                  href={msg.href}
                  className="group block"
                >
                  <Card className="flex gap-4 p-4 transition-all group-hover:border-slate-300 group-hover:shadow-sm">
                    {msg.listingImage && (
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                        <img
                          src={msg.listingImage}
                          alt={msg.listingTitle}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 truncate">
                              {msg.buyerName || msg.buyerEmail}
                            </span>
                            <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 uppercase">
                              {msg.type === 'order' ? 'Order' : 'Offer'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {msg.listingTitle}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {formatDistanceToNow(msg.lastMessageAt, { addSuffix: true })}
                          </span>
                          {msg.unreadCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                              {msg.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-1">
                        <span className="font-medium text-slate-700">
                          {msg.senderType === 'SELLER' ? 'You: ' : ''}
                        </span>
                        {msg.lastMessage}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
