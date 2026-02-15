import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import { notifyNewOffer } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const buyerId = await getBuyerId();
    if (!buyerId) {
      return NextResponse.json(
        { error: "You must be logged in to send an offer" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      listingId,
      message,
      sizes,
      quantity,
      quantityRange,
      pricePerPair,
    } = body;

    if (!listingId || !message) {
      return NextResponse.json(
        { error: "Listing and message are required" },
        { status: 400 }
      );
    }

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: Number(listingId) },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Create or find existing conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        buyerId_listingId: {
          buyerId,
          listingId: Number(listingId),
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          buyerId,
          listingId: Number(listingId),
          status: "ACTIVE",
          unreadByAdmin: 1,
        },
      });
    } else {
      // Update conversation
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          unreadByAdmin: { increment: 1 },
          status: "ACTIVE",
        },
      });
    }

    // Create offer message
    const offerMessage = await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: "BUYER",
        messageType: "OFFER",
        body: message,
        metadata: {
          sizes,
          quantity,
          quantityRange,
          pricePerPair,
        },
      },
    });

    // Notify admin of new offer
    await notifyNewOffer({
      conversationId: conversation.id,
      listingTitle: listing.title,
      quantity: quantity || 0,
      pricePerPair: pricePerPair || undefined,
      message,
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      messageId: offerMessage.id,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Failed to send offer" },
      { status: 500 }
    );
  }
}
