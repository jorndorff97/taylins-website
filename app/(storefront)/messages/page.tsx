import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import Link from "next/link";

export default async function MessagesPage() {
  const buyerId = await getBuyerId();

  if (!buyerId) {
    redirect("/login?redirect=/messages");
  }

  const conversations = await prisma.conversation.findMany({
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">No messages yet</p>
          <Link
            href="/browse"
            className="inline-block rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const lastMessage = conv.messages[0];
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  {conv.listing.images[0] && (
                    <img
                      src={conv.listing.images[0].url}
                      alt={conv.listing.title}
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {conv.listing.title}
                      </h3>
                      {conv.unreadByBuyer > 0 && (
                        <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                          {conv.unreadByBuyer > 9 ? "9+" : conv.unreadByBuyer}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-slate-600 truncate mt-1">
                        {lastMessage.senderType === "BUYER" ? "You: " : "Seller: "}
                        {lastMessage.body}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
