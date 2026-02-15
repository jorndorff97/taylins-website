import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import Link from "next/link";

type UnifiedMessage = {
  id: number;
  type: 'order' | 'conversation';
  listingTitle: string;
  listingImage: string | null;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  href: string;
  senderType?: string;
};

export default async function MessagesPage() {
  const buyerId = await getBuyerId();

  if (!buyerId) {
    redirect("/login?redirect=/messages");
  }

  let orders: any[] = [];
  let conversations: any[] = [];

  // Fetch orders with messages
  try {
    orders = await prisma.order.findMany({
      where: {
        buyerId,
        messages: {
          some: {}, // Only orders that have messages
        },
      },
      include: {
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
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  // Fetch conversations
  try {
    conversations = await prisma.conversation.findMany({
      where: {
        buyerId,
      },
      include: {
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
  } catch (error) {
    console.error("Error fetching conversations:", error);
  }

  // Transform orders into unified format
  const orderMessages: UnifiedMessage[] = orders.map((order) => {
    const lastMessage = order.messages[0];
    return {
      id: order.id,
      type: 'order' as const,
      listingTitle: order.listing.title,
      listingImage: order.listing.images[0]?.url || null,
      lastMessage: lastMessage?.body || "Order request",
      lastMessageAt: lastMessage?.createdAt || order.updatedAt,
      unreadCount: 0, // Orders don't track unread yet
      href: `/order/${order.id}`,
      senderType: lastMessage?.senderType,
    };
  });

  // Transform conversations into unified format
  const conversationMessages: UnifiedMessage[] = conversations.map((conv) => {
    const lastMessage = conv.messages[0];
    return {
      id: conv.id,
      type: 'conversation' as const,
      listingTitle: conv.listing.title,
      listingImage: conv.listing.images[0]?.url || null,
      lastMessage: lastMessage?.body || "New conversation",
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv.unreadByBuyer,
      href: `/messages/${conv.id}`,
      senderType: lastMessage?.senderType,
    };
  });

  // Combine and sort by last message time
  const allMessages = [...orderMessages, ...conversationMessages].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-8">Messages</h1>

      {allMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">No conversations yet</h2>
          <p className="text-slate-600 text-center mb-8 max-w-md leading-relaxed">
            When you send an offer or request a quote on a product, your conversation with the seller will appear here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-slate-800 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allMessages.map((msg) => (
            <Link
              key={`${msg.type}-${msg.id}`}
              href={msg.href}
              className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex gap-4">
                {msg.listingImage && (
                  <img
                    src={msg.listingImage}
                    alt={msg.listingTitle}
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {msg.listingTitle}
                      </h3>
                      <span className="inline-block mt-0.5 text-xs text-slate-500">
                        {msg.type === 'order' ? 'Order Request' : 'Offer'}
                      </span>
                    </div>
                    {msg.unreadCount > 0 && (
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                        {msg.unreadCount > 9 ? "9+" : msg.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 truncate mt-1">
                    {msg.senderType === "BUYER" ? "You: " : "Seller: "}
                    {msg.lastMessage}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(msg.lastMessageAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
