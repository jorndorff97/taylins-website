import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";

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
      lastMessage: lastMessage?.body || "Order request sent",
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
      lastMessage: lastMessage?.body || "Inquiry started",
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
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">Messages</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Manage your inquiries and order updates</p>
        </div>
        <div className="hidden sm:block">
          <Link href="/browse" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
            Continue Shopping →
          </Link>
        </div>
      </div>

      {allMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your inbox is empty</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xs leading-relaxed text-sm">
            When you send an offer or message about a product, it will show up here.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-10 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-900/10"
          >
            Start Browsing
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {allMessages.map((msg) => (
            <Link
              key={`${msg.type}-${msg.id}`}
              href={msg.href}
              className="group block"
            >
              <Card className="p-5 flex gap-5 transition-all group-hover:border-slate-300 group-hover:shadow-md border-slate-200/60 shadow-sm relative overflow-hidden">
                {msg.unreadCount > 0 && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                )}
                
                {msg.listingImage ? (
                  <div className="h-20 w-20 rounded-2xl bg-white border border-slate-100 flex-shrink-0 overflow-hidden shadow-sm p-2 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={msg.listingImage}
                      alt={msg.listingTitle}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">
                        {msg.listingTitle}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          msg.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {msg.type === 'order' ? 'Order' : 'Inquiry'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          • {formatDistanceToNow(new Date(msg.lastMessageAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {msg.unreadCount > 0 && (
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-4 ring-white">
                        {msg.unreadCount > 9 ? "9+" : msg.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 truncate mt-1 leading-relaxed pr-4">
                    <span className="font-semibold text-slate-800">
                      {msg.senderType === "BUYER" ? "You: " : "Seller: "}
                    </span>
                    {msg.lastMessage}
                  </p>
                </div>
                <div className="flex items-center group-hover:translate-x-1 transition-transform pr-2">
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
