import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-config";
import { ConversationThread } from "@/components/storefront/ConversationThread";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;
  const userId = await getUserId();

  if (!userId) {
    redirect(`/login?redirect=${encodeURIComponent(`/messages/${id}`)}`);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: Number(id) },
    include: {
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  if (conversation.userId !== userId) {
    redirect("/messages");
  }

  // Mark messages as read by user
  if (conversation.unreadByUser > 0) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { unreadByUser: 0 },
    });
  }

  const latestOrder = conversation.orders[0];
  const isPaid = latestOrder?.status === "PAID" || latestOrder?.status === "SHIPPED";

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex flex-col bg-white">
      <div className="flex-1 mx-auto w-full max-w-3xl px-4 flex flex-col min-h-0">
        <ConversationThread
          conversation={{
            id: conversation.id,
            listingId: conversation.listingId,
            listingTitle: conversation.listing.title,
            listingImage: conversation.listing.images[0]?.url ?? null,
            messages: conversation.messages.map((m) => ({
              id: m.id,
              senderType: m.senderType,
              messageType: m.messageType,
              body: m.body,
              metadata: m.metadata as Record<string, any> | null,
              createdAt: m.createdAt.toISOString(),
            })),
          }}
          isPaid={isPaid}
        />
      </div>
    </div>
  );
}
