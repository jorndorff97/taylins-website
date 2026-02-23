import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasValidAdminSession } from "@/lib/auth";
import Stripe from "stripe";

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    typescript: true,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await hasValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { quantity, pricePerPair, message, sizes } = body;

    if (!quantity || !pricePerPair) {
      return NextResponse.json(
        { error: "Quantity and price are required" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        listing: {
          include: {
            images: { take: 1, orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const totalAmount = quantity * pricePerPair;
    const stripe = getStripe();

    let paymentUrl: string;

    if (stripe) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      const order = await prisma.order.create({
        data: {
          userId: conversation.userId,
          listingId: conversation.listingId,
          conversationId: conversation.id,
          status: "PENDING",
          totalPairs: quantity,
          totalAmount,
          items: {
            create: sizes && Array.isArray(sizes) && sizes.length > 0
              ? sizes.map((s: { sizeLabel: string; quantity: number }) => ({
                  sizeLabel: s.sizeLabel,
                  quantity: s.quantity,
                  pricePerPair,
                }))
              : [{
                  quantity,
                  pricePerPair,
                }],
          },
        },
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: conversation.listing.title,
                images: conversation.listing.images[0]?.url
                  ? [conversation.listing.images[0].url]
                  : [],
                description: `${quantity} pairs @ $${pricePerPair}/pair`,
              },
              unit_amount: Math.round(pricePerPair * 100),
            },
            quantity,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/order/${order.id}?payment=success`,
        cancel_url: `${baseUrl}/messages/${conversation.id}?payment=cancelled`,
        customer_email: conversation.user.email,
        metadata: {
          orderId: order.id.toString(),
          conversationId: conversation.id.toString(),
        },
        payment_intent_data: {
          metadata: {
            orderId: order.id.toString(),
          },
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeCheckoutSessionId: session.id },
      });

      paymentUrl = session.url!;
    } else {
      paymentUrl = `[Payment link - Stripe not configured] ${quantity} pairs @ $${pricePerPair}/pair = $${totalAmount}`;
    }

    const messageBody = message
      ? `${message}\n\nPayment link: ${paymentUrl}`
      : `Here's your payment link for ${quantity} pairs @ $${pricePerPair.toFixed(2)}/pair (Total: $${totalAmount.toFixed(2)}):\n\n${paymentUrl}`;

    const newMessage = await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: "SELLER",
        messageType: "PAYMENT_LINK",
        body: messageBody,
        metadata: {
          quantity,
          pricePerPair,
          totalAmount,
          paymentUrl,
          sizes: sizes ?? null,
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unreadByUser: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      messageId: newMessage.id,
      paymentUrl,
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}
