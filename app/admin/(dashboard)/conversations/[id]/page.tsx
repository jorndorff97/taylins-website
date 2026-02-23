import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminConversationThread } from "@/components/admin/AdminConversationThread";

interface AdminConversationPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminConversationPage({ params }: AdminConversationPageProps) {
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: Number(id) },
    include: {
      user: true,
      listing: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          tierPrices: { orderBy: { minQty: "asc" } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  const startingPricePerPair =
    conversation.listing.pricingMode === "FLAT" && conversation.listing.flatPricePerPair
      ? Number(conversation.listing.flatPricePerPair)
      : conversation.listing.tierPrices.length > 0
        ? Number(conversation.listing.tierPrices[0].pricePerPair)
        : null;

  if (conversation.unreadByAdmin > 0) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { unreadByAdmin: 0 },
    });
  }

  return (
    <>
      <AdminHeader
        title={conversation.user.name || conversation.user.email}
        backHref="/admin/messages"
      />
      <main className="flex-1 bg-background overflow-hidden">
        <div className="mx-auto max-w-3xl px-6 py-4 h-full min-w-0">
          <AdminConversationThread
            conversation={{
              id: conversation.id,
              listingId: conversation.listingId,
              listingTitle: conversation.listing.title,
              listingImage: conversation.listing.images[0]?.url ?? null,
              listingPrice: startingPricePerPair,
              buyerEmail: conversation.user.email,
              buyerName: conversation.user.name,
              messages: conversation.messages.map((m) => ({
                id: m.id,
                senderType: m.senderType,
                messageType: m.messageType,
                body: m.body,
                metadata: m.metadata as Record<string, unknown> | null,
                createdAt: m.createdAt.toISOString(),
              })),
            }}
          />
        </div>
      </main>
    </>
  );
}
